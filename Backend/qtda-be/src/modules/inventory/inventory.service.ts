import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  InventoryLot,
  InventoryLotDocument,
  Product,
  ProductDocument,
  StockMovement,
  StockMovementDocument,
  Supplier,
  SupplierDocument,
} from '../../schemas';
import { StockMovementType, StockMovementReason } from '../../common/enums';

export interface CreateInventoryLotDto {
  productId: string;
  quantityIn: number;
  costPerUnit: number;
  supplierId?: string;
  receivedDate?: Date;
  note?: string;
}

export interface StockAdjustmentDto {
  productId: string;
  lotId?: string;
  quantity: number;
  reason: string;
  note?: string;
  actorId: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryLot.name)
    private inventoryLotModel: Model<InventoryLotDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovementDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  async createInventoryLot(
    dto: CreateInventoryLotDto,
    actorId: string,
  ): Promise<InventoryLotDocument> {
    const session = await this.inventoryLotModel.db.startSession();

    try {
      return await session.withTransaction(async () => {
        // Validate product exists
        const product = await this.productModel.findById(dto.productId);
        if (!product) {
          throw new BadRequestException('Product not found');
        }

        // Validate supplier if provided
        if (dto.supplierId) {
          const supplier = await this.supplierModel.findById(dto.supplierId);
          if (!supplier) {
            throw new BadRequestException('Supplier not found');
          }
        }

        // Generate lot code
        const receivedDate = dto.receivedDate || new Date();
        const lotCode = this.generateLotCode(
          product.sku || 'UNKNOWN',
          receivedDate,
        );

        // Calculate expiry date
        const expiryDate = product.expiryDays
          ? new Date(
              receivedDate.getTime() + product.expiryDays * 24 * 60 * 60 * 1000,
            )
          : undefined;

        // Create inventory lot
        const lot = new this.inventoryLotModel({
          product: dto.productId,
          lotCode,
          receivedDate,
          expiryDate,
          quantityIn: dto.quantityIn,
          quantityAvailable: dto.quantityIn,
          costPerUnit: dto.costPerUnit,
          supplier: dto.supplierId,
          note: dto.note,
        });

        await lot.save({ session });

        // Create stock movement
        await this.stockMovementModel.create(
          [
            {
              type: StockMovementType.IN,
              product: dto.productId,
              lot: lot._id,
              quantity: dto.quantityIn,
              reason: StockMovementReason.PURCHASE,
              actor: actorId,
              note: `Nhập lô ${lotCode}`,
            },
          ],
          { session },
        );

        return lot;
      });
    } finally {
      await session.endSession();
    }
  }

  async adjustStock(dto: StockAdjustmentDto): Promise<void> {
    const session = await this.inventoryLotModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Validate product exists
        const product = await this.productModel.findById(dto.productId);
        if (!product) {
          throw new BadRequestException('Product not found');
        }

        if (dto.lotId) {
          // Adjust specific lot
          const lot = await this.inventoryLotModel.findById(dto.lotId);
          if (!lot) {
            throw new BadRequestException('Inventory lot not found');
          }

          if (dto.quantity > 0) {
            // Increase stock
            lot.quantityAvailable += dto.quantity;
            lot.quantityIn += dto.quantity;
          } else {
            // Decrease stock
            const decreaseAmount = Math.abs(dto.quantity);
            if (lot.quantityAvailable < decreaseAmount) {
              throw new BadRequestException('Insufficient stock in lot');
            }
            lot.quantityAvailable -= decreaseAmount;
          }

          await lot.save({ session });

          // Create stock movement
          await this.stockMovementModel.create(
            [
              {
                type: StockMovementType.ADJUST,
                product: dto.productId,
                lot: dto.lotId,
                quantity: Math.abs(dto.quantity),
                reason: dto.reason,
                actor: dto.actorId,
                note: dto.note,
              },
            ],
            { session },
          );
        } else {
          // Adjust product total stock (distribute across lots)
          const lots = await this.inventoryLotModel
            .find({
              product: dto.productId,
              quantityAvailable: { $gt: 0 },
            })
            .sort({ expiryDate: 1 }); // FIFO order

          if (dto.quantity < 0) {
            // Decrease stock
            const decreaseAmount = Math.abs(dto.quantity);
            let remaining = decreaseAmount;

            for (const lot of lots) {
              if (remaining <= 0) break;

              const toDecrease = Math.min(remaining, lot.quantityAvailable);
              lot.quantityAvailable -= toDecrease;
              remaining -= toDecrease;

              await lot.save({ session });

              // Create stock movement for this lot
              await this.stockMovementModel.create(
                [
                  {
                    type: StockMovementType.ADJUST,
                    product: dto.productId,
                    lot: lot._id,
                    quantity: toDecrease,
                    reason: dto.reason,
                    actor: dto.actorId,
                    note: dto.note,
                  },
                ],
                { session },
              );
            }

            if (remaining > 0) {
              throw new BadRequestException('Insufficient total stock');
            }
          } else {
            // Increase stock - add to first lot or create new lot
            if (lots.length > 0) {
              const firstLot = lots[0];
              firstLot.quantityAvailable += dto.quantity;
              firstLot.quantityIn += dto.quantity;
              await firstLot.save({ session });
            } else {
              // Create new lot
              const lotCode = this.generateLotCode(
                product.sku || 'UNKNOWN',
                new Date(),
              );
              const newLot = new this.inventoryLotModel({
                product: dto.productId,
                lotCode,
                receivedDate: new Date(),
                quantityIn: dto.quantity,
                quantityAvailable: dto.quantity,
                costPerUnit: product.price * 0.7, // Default cost
                note: 'Auto-created for stock adjustment',
              });
              await newLot.save({ session });
            }

            // Create stock movement
            await this.stockMovementModel.create(
              [
                {
                  type: StockMovementType.ADJUST,
                  product: dto.productId,
                  quantity: dto.quantity,
                  reason: dto.reason,
                  actor: dto.actorId,
                  note: dto.note,
                },
              ],
              { session },
            );
          }
        }
      });
    } finally {
      await session.endSession();
    }
  }

  async getAvailableStock(productId: string): Promise<{
    totalAvailable: number;
    lots: {
      lotId: string;
      lotCode: string;
      quantityAvailable: number;
      expiryDate?: Date;
      costPerUnit: number;
    }[];
  }> {
    const lots = await this.inventoryLotModel
      .find({
        product: productId,
        quantityAvailable: { $gt: 0 },
      })
      .sort({ expiryDate: 1 }); // FIFO order

    const totalAvailable = lots.reduce(
      (sum, lot) => sum + lot.quantityAvailable,
      0,
    );

    return {
      totalAvailable,
      lots: lots.map((lot) => ({
        lotId: (lot._id as any).toString(),
        lotCode: lot.lotCode,
        quantityAvailable: lot.quantityAvailable,
        expiryDate: lot.expiryDate,
        costPerUnit: lot.costPerUnit,
      })),
    };
  }

  async getExpiringStock(days: number = 3): Promise<
    {
      product: string;
      lotCode: string;
      quantityAvailable: number;
      expiryDate: Date;
      daysUntilExpiry: number;
    }[]
  > {
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const lots = await this.inventoryLotModel
      .find({
        expiryDate: { $lte: expiryDate, $ne: null },
        quantityAvailable: { $gt: 0 },
      })
      .populate('product', 'name sku');

    return lots.map((lot) => ({
      product: (lot.product as any).name,
      lotCode: lot.lotCode,
      quantityAvailable: lot.quantityAvailable,
      expiryDate: lot.expiryDate!,
      daysUntilExpiry: lot.expiryDate
        ? Math.ceil(
            (lot.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
          )
        : 0,
    }));
  }

  private generateLotCode(sku: string | undefined, date: Date): string {
    const skuCode = sku || 'UNKNOWN';
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${skuCode}-${dateStr}-${random}`;
  }
}
