import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StockMovementType, StockMovementReason } from '../common/enums';

export type StockMovementDocument = StockMovement & Document;

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ enum: Object.values(StockMovementType), required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InventoryLot' })
  lot?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ enum: Object.values(StockMovementReason), required: true })
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  refInvoice?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  actor: Types.ObjectId;

  @Prop({ trim: true })
  note?: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);

// Indexes
StockMovementSchema.index({ product: 1, createdAt: -1 });
StockMovementSchema.index({ type: 1, createdAt: -1 });
StockMovementSchema.index({ createdAt: -1 });
