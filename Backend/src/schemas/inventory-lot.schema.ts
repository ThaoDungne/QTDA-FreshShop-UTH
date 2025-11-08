import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryLotDocument = InventoryLot & Document;

@Schema({ timestamps: true })
export class InventoryLot {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, trim: true })
  lotCode: string;

  @Prop({ required: true })
  receivedDate: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ required: true, min: 0 })
  quantityIn: number;

  @Prop({ required: true, min: 0 })
  quantityAvailable: number;

  @Prop({ required: true, min: 0 })
  costPerUnit: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplier?: Types.ObjectId;

  @Prop({ trim: true })
  note?: string;
}

export const InventoryLotSchema = SchemaFactory.createForClass(InventoryLot);

// Indexes
InventoryLotSchema.index({ product: 1, expiryDate: 1 });
InventoryLotSchema.index({ quantityAvailable: 1 });
InventoryLotSchema.index({ lotCode: 1 }, { unique: true });
