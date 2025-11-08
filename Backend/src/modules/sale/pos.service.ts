import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  Invoice,
  InvoiceDocument,
  InvoiceItem,
  InvoiceItemDocument,
  Payment,
  PaymentDocument,
  StockMovement,
  StockMovementDocument,
  LoyaltyLedger,
  LoyaltyLedgerDocument,
  Customer,
  CustomerDocument,
  Product,
  ProductDocument,
  InventoryLot,
  InventoryLotDocument,
} from '../../schemas';
import {
  StockMovementType,
  StockMovementReason,
  LoyaltyLedgerType,
  InvoiceStatus,
  PromotionScope,
  PromotionType,
} from '../../common/enums';

export interface CreateInvoiceDto {
  customerId?: string;
  cashierId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
  }[];
  paymentMethod?: string;
  paidAmount: number;
  note?: string;
}

export interface InvoiceResult {
  invoice: InvoiceDocument;
  items: InvoiceItemDocument[];
  payment: PaymentDocument;
  stockMovements: StockMovementDocument[];
  loyaltyLedger?: LoyaltyLedgerDocument;
}

@Injectable()
export class PosService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItemDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovementDocument>,
    @InjectModel(LoyaltyLedger.name)
    private loyaltyLedgerModel: Model<LoyaltyLedgerDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(InventoryLot.name)
    private inventoryLotModel: Model<InventoryLotDocument>,
    @InjectModel('Promotion') private promotionModel: Model<any>,
  ) {}

  async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceResult> {
    const session = await this.invoiceModel.db.startSession();

    try {
      return await session.withTransaction(async () => {
        // Validate customer if provided
        let customer: CustomerDocument | null = null;
        if (dto.customerId) {
          customer = await this.customerModel.findById(dto.customerId);
          if (!customer) {
            throw new BadRequestException('Customer not found');
          }
        }

        // Validate products and check stock
        const productIds = dto.items.map((item) => item.productId);
        const products = await this.productModel.find({
          _id: { $in: productIds },
        });

        if (products.length !== productIds.length) {
          throw new BadRequestException('Some products not found');
        }

        // Check stock availability and prepare FIFO allocation
        const stockAllocations = await this.prepareStockAllocation(
          dto.items,
          products,
        );

        // Calculate totals (pre-promotion)
        let subtotal = 0;
        const invoiceItems: any[] = [];

        for (const item of dto.items) {
          const product = products.find(
            (p) => (p._id as any).toString() === item.productId,
          );
          const unitPrice = item.unitPrice || product?.price || 0;
          const discount = item.discount || 0;
          const lineTotal = (unitPrice - discount) * item.quantity;

          subtotal += lineTotal;
          invoiceItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            discount,
            lineTotal,
            unit: product?.unit || 'unit',
          });
        }

        // Apply promotions (if any)
        const { discountTotal, bonusPoints, appliedPromotionIds } =
          await this.applyPromotions({
            customer,
            products,
            invoiceItems,
            subtotal,
            promotionIds: (dto as any).promotionIds || [],
          });

        const taxTotal = 0; // No tax for now
        const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal);

        if (dto.paidAmount < grandTotal) {
          throw new BadRequestException('Insufficient payment amount');
        }

        // Generate invoice code
        const invoiceCode = this.generateInvoiceCode();

        // Create invoice
        const invoice = new this.invoiceModel({
          code: invoiceCode,
          customer: dto.customerId,
          cashier: dto.cashierId,
          itemsSummary: {
            itemCount: invoiceItems.length,
            subtotal,
            discountTotal,
            taxTotal,
            grandTotal,
          },
          paidAmount: dto.paidAmount,
          changeAmount: dto.paidAmount - grandTotal,
          paymentMethod: dto.paymentMethod || 'cash',
          status: InvoiceStatus.COMPLETED,
          promotionIds:
            appliedPromotionIds && appliedPromotionIds.length
              ? appliedPromotionIds
              : undefined,
        });

        await invoice.save({ session });

        // Create invoice items and process stock movements
        const savedItems: any[] = [];
        const stockMovements: any[] = [];

        for (let i = 0; i < invoiceItems.length; i++) {
          const item = invoiceItems[i];
          const product = products.find(
            (p) => (p._id as any).toString() === item.productId,
          );
          const allocation = stockAllocations[i];

          // Create invoice item
          const invoiceItem = new this.invoiceItemModel({
            invoice: invoice._id,
            product: item.productId,
            lot: allocation.lotId,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            discount: item.discount,
            lineTotal: item.lineTotal,
          });

          await invoiceItem.save({ session });
          savedItems.push(invoiceItem);

          // Process stock movements for each lot used
          for (const lotUsage of allocation.lotUsages) {
            // Update inventory lot
            const lot = await this.inventoryLotModel.findById(lotUsage.lotId);
            if (lot) {
              lot.quantityAvailable -= lotUsage.quantity;
              await lot.save({ session });
            }

            // Create stock movement
            const stockMovement = new this.stockMovementModel({
              type: StockMovementType.OUT,
              product: item.productId,
              lot: lotUsage.lotId,
              quantity: lotUsage.quantity,
              reason: StockMovementReason.SALE,
              refInvoice: invoice._id,
              actor: dto.cashierId,
              note: `Bán hàng - HĐ ${invoiceCode}`,
            });

            await stockMovement.save({ session });
            stockMovements.push(stockMovement);
          }
        }

        // Create payment
        const payment = new this.paymentModel({
          invoice: invoice._id,
          amount: dto.paidAmount,
          method: dto.paymentMethod || 'cash',
          paidAt: new Date(),
          note: dto.note,
        });

        await payment.save({ session });

        // Process loyalty points if customer exists (include bonusPoints from promotions)
        let loyaltyLedger: LoyaltyLedgerDocument | null = null;
        if (customer) {
          const earnedPoints =
            Math.floor(grandTotal / 1000) + (bonusPoints || 0); // 1 point per 1000 VND + bonus
          if (earnedPoints > 0) {
            customer.loyaltyPoints += earnedPoints;
            await customer.save({ session });

            loyaltyLedger = new this.loyaltyLedgerModel({
              customer: customer._id,
              type: LoyaltyLedgerType.EARN,
              points: earnedPoints,
              reason: 'PURCHASE',
              refInvoice: invoice._id,
              balanceAfter: customer.loyaltyPoints,
            });

            await loyaltyLedger.save({ session });
          }
        }

        return {
          invoice,
          items: savedItems,
          payment,
          stockMovements,
          loyaltyLedger: loyaltyLedger || undefined,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  private async applyPromotions(params: {
    customer: CustomerDocument | null;
    products: ProductDocument[];
    invoiceItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      lineTotal: number;
      unit: string;
    }>;
    subtotal: number;
    promotionIds: string[];
  }): Promise<{
    discountTotal: number;
    bonusPoints: number;
    appliedPromotionIds: string[];
  }> {
    const { products, invoiceItems, subtotal, promotionIds } = params;
    if (!promotionIds || promotionIds.length === 0) {
      return { discountTotal: 0, bonusPoints: 0, appliedPromotionIds: [] };
    }

    // Load active promotions by IDs and within time window
    const now = new Date();
    const promos = await this.promotionModel.find({
      _id: { $in: promotionIds },
      active: true,
      $and: [
        { $or: [{ startAt: { $exists: false } }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: { $exists: false } }, { endAt: { $gte: now } }] },
      ],
    });

    let orderLevelDiscount = 0;
    const itemLevelDiscounts: Record<string, number> = {}; // productId -> extra discount per unit
    let bonusPoints = 0;
    const appliedIds: string[] = [];

    for (const promo of promos) {
      const scope = promo.scope as PromotionScope;
      const type = promo.type as PromotionType;
      const conditions = promo.conditions || {};
      const effects = promo.effects || {};

      // Basic condition checks
      if (conditions.minSubtotal && subtotal < conditions.minSubtotal) {
        continue;
      }

      if (scope === PromotionScope.ORDER) {
        if (type === PromotionType.PERCENT && effects.percent) {
          orderLevelDiscount += Math.floor((subtotal * effects.percent) / 100);
          appliedIds.push(promo._id.toString());
        } else if (type === PromotionType.AMOUNT && effects.amount) {
          orderLevelDiscount += effects.amount;
          appliedIds.push(promo._id.toString());
        } else if (
          type === PromotionType.POINT_MULTIPLIER &&
          effects.bonusPoints
        ) {
          bonusPoints += effects.bonusPoints;
          appliedIds.push(promo._id.toString());
        }
      } else if (scope === PromotionScope.ITEM) {
        const allowedProducts: string[] | undefined = conditions.productIn;
        const allowedCategories: string[] | undefined = conditions.categoryIn;
        for (const item of invoiceItems) {
          const product = products.find(
            (p) => (p._id as any).toString() === item.productId,
          );
          const productAllowed =
            !allowedProducts || allowedProducts.includes(item.productId);
          const categoryAllowed =
            !allowedCategories ||
            (product && allowedCategories.includes(product.category));
          if (!productAllowed || !categoryAllowed) continue;

          if (type === PromotionType.PERCENT && effects.percent) {
            const extra = Math.floor((item.unitPrice * effects.percent) / 100);
            itemLevelDiscounts[item.productId] =
              (itemLevelDiscounts[item.productId] || 0) + extra;
          } else if (type === PromotionType.AMOUNT && effects.amount) {
            const extra = effects.amount; // per unit
            itemLevelDiscounts[item.productId] =
              (itemLevelDiscounts[item.productId] || 0) + extra;
          } else if (
            type === PromotionType.POINT_MULTIPLIER &&
            effects.bonusPoints
          ) {
            bonusPoints += effects.bonusPoints;
          }
          appliedIds.push(promo._id.toString());
        }
      }
    }

    // Apply item-level extra discount into invoiceItems and recompute lineTotals
    let recomputedSubtotal = 0;
    for (const item of invoiceItems) {
      const extra = itemLevelDiscounts[item.productId] || 0;
      item.discount = (item.discount || 0) + extra;
      item.lineTotal = Math.max(
        0,
        (item.unitPrice - item.discount) * item.quantity,
      );
      recomputedSubtotal += item.lineTotal;
    }

    // Recompute order-level discount based on updated subtotal if desired; keep as is for simplicity
    const totalDiscount = orderLevelDiscount + (subtotal - recomputedSubtotal);
    return {
      discountTotal: Math.max(0, totalDiscount),
      bonusPoints: Math.max(0, bonusPoints),
      appliedPromotionIds: Array.from(new Set(appliedIds)),
    };
  }

  async voidInvoice(
    invoiceId: string,
    actorId: string,
    reason: string,
  ): Promise<void> {
    const session = await this.invoiceModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        const invoice = await this.invoiceModel.findById(invoiceId);
        if (!invoice) {
          throw new BadRequestException('Invoice not found');
        }

        if (invoice.status === 'void') {
          throw new BadRequestException('Invoice already voided');
        }

        // Get invoice items
        const items = await this.invoiceItemModel.find({ invoice: invoiceId });

        // Reverse stock movements
        for (const item of items) {
          if (item.lot) {
            const lot = await this.inventoryLotModel.findById(item.lot);
            if (lot) {
              lot.quantityAvailable += item.quantity;
              await lot.save({ session });
            }

            // Create reverse stock movement
            await this.stockMovementModel.create(
              [
                {
                  type: StockMovementType.IN,
                  product: item.product,
                  lot: item.lot,
                  quantity: item.quantity,
                  reason: 'VOID',
                  refInvoice: invoiceId,
                  actor: actorId,
                  note: `Hủy hóa đơn - ${reason}`,
                },
              ],
              { session },
            );
          }
        }

        // Reverse loyalty points if customer exists
        if (invoice.customer) {
          const customer = await this.customerModel.findById(invoice.customer);
          if (customer) {
            const earnedPoints = Math.floor(
              invoice.itemsSummary.grandTotal / 1000,
            );
            if (earnedPoints > 0) {
              customer.loyaltyPoints -= earnedPoints;
              await customer.save({ session });

              await this.loyaltyLedgerModel.create(
                [
                  {
                    customer: customer._id,
                    type: LoyaltyLedgerType.ADJUST,
                    points: -earnedPoints,
                    reason: 'VOID',
                    refInvoice: invoiceId,
                    balanceAfter: customer.loyaltyPoints,
                  },
                ],
                { session },
              );
            }
          }
        }

        // Update invoice status
        invoice.status = InvoiceStatus.VOID;
        await invoice.save({ session });
      });
    } finally {
      await session.endSession();
    }
  }

  private async prepareStockAllocation(
    items: { productId: string; quantity: number }[],
    products: ProductDocument[],
  ): Promise<
    {
      productId: string;
      lotId?: string;
      lotUsages: { lotId: string; quantity: number }[];
    }[]
  > {
    const allocations: any[] = [];

    for (const item of items) {
      const product = products.find(
        (p) => (p._id as any).toString() === item.productId,
      );

      // Get available lots for this product (FIFO order)
      const lots = await this.inventoryLotModel
        .find({
          product: item.productId,
          quantityAvailable: { $gt: 0 },
        })
        .sort({ expiryDate: 1 });

      if (lots.length === 0) {
        throw new BadRequestException(
          `No stock available for product ${product?.name || 'Unknown'}`,
        );
      }

      let remainingQuantity = item.quantity;
      const lotUsages: { lotId: string; quantity: number }[] = [];

      for (const lot of lots) {
        if (remainingQuantity <= 0) break;

        const useQuantity = Math.min(remainingQuantity, lot.quantityAvailable);
        lotUsages.push({
          lotId: (lot._id as any).toString(),
          quantity: useQuantity,
        });

        remainingQuantity -= useQuantity;
      }

      if (remainingQuantity > 0) {
        throw new BadRequestException(
          `Insufficient stock for product ${product?.name || 'Unknown'}. Available: ${item.quantity - remainingQuantity}, Required: ${item.quantity}`,
        );
      }

      allocations.push({
        productId: item.productId,
        lotId: lotUsages[0]?.lotId,
        lotUsages,
      });
    }

    return allocations;
  }

  private generateInvoiceCode(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `INV-${dateStr}-${random}`;
  }
}
