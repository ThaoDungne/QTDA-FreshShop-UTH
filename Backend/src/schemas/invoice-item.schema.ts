import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceItemDocument = InvoiceItem & Document;

@Schema({ timestamps: true })
export class InvoiceItem {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true })
  invoice: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InventoryLot' })
  lot?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, trim: true })
  unit: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  lineTotal: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

// Indexes
InvoiceItemSchema.index({ invoice: 1 });
InvoiceItemSchema.index({ product: 1 });
InvoiceItemSchema.index({ createdAt: -1 });
