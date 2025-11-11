import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
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
    try {
      // Validate và convert actorId thành ObjectId
      let actorObjectId: Types.ObjectId;
      try {
        actorObjectId = new Types.ObjectId(actorId);
      } catch (error) {
        throw new BadRequestException(
          `Invalid actor ID format: ${actorId}. Must be a valid MongoDB ObjectId.`,
        );
      }

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

      await lot.save();

      // Create stock movement với actor là ObjectId
      try {
        await this.stockMovementModel.create({
          type: StockMovementType.IN,
          product: dto.productId,
          lot: lot._id,
          quantity: dto.quantityIn,
          reason: StockMovementReason.PURCHASE,
          actor: actorObjectId,
          note: `Nhập lô ${lotCode}`,
        });
      } catch (error: any) {
        console.error('Error creating stock movement:', error);
        // Nếu tạo stock movement thất bại, xóa lot đã tạo để rollback
        await this.inventoryLotModel.findByIdAndDelete(lot._id);
        throw new InternalServerErrorException(
          `Failed to create stock movement: ${error.message}`,
        );
      }

      return lot;
    } catch (error: any) {
      console.error('Error in createInventoryLot:', error);
      // Re-throw nếu đã là HttpException
      if (error.statusCode) {
        throw error;
      }
      // Nếu không, wrap trong InternalServerErrorException
      throw new InternalServerErrorException(
        `Failed to create inventory lot: ${error.message}`,
      );
    }
  }

  async adjustStock(dto: StockAdjustmentDto): Promise<void> {
    try {
      // Validate và convert actorId thành ObjectId
      let actorObjectId: Types.ObjectId;
      try {
        actorObjectId = new Types.ObjectId(dto.actorId);
      } catch (error) {
        throw new BadRequestException(
          `Invalid actor ID format: ${dto.actorId}. Must be a valid MongoDB ObjectId.`,
        );
      }

      // Validate product exists
      const product = await this.productModel.findById(dto.productId);
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      // Thực hiện điều chỉnh không dùng transaction (vì MongoDB standalone không hỗ trợ)
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

          await lot.save();

          // Create stock movement
          await this.stockMovementModel.create({
            type: StockMovementType.ADJUST,
            product: dto.productId,
            lot: dto.lotId,
            quantity: Math.abs(dto.quantity),
            reason: dto.reason,
            actor: actorObjectId,
            note: dto.note,
          });
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

              await lot.save();

              // Create stock movement for this lot
              await this.stockMovementModel.create({
                type: StockMovementType.ADJUST,
                product: dto.productId,
                lot: lot._id,
                quantity: toDecrease,
                reason: dto.reason,
                actor: actorObjectId,
                note: dto.note,
              });
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
              await firstLot.save();
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
              await newLot.save();
            }

            // Create stock movement
            await this.stockMovementModel.create({
              type: StockMovementType.ADJUST,
              product: dto.productId,
              quantity: dto.quantity,
              reason: dto.reason,
              actor: actorObjectId,
              note: dto.note,
            });
          }
        }
    } catch (error: any) {
      console.error('Error in adjustStock:', error);
      // Re-throw nếu đã là HttpException
      if (error.statusCode) {
        throw error;
      }
      // Nếu không, wrap trong InternalServerErrorException
      throw new InternalServerErrorException(
        `Failed to adjust stock: ${error.message}`,
      );
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

