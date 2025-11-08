import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod, InvoiceStatus } from '../common/enums';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, trim: true })
  code: string;

  @Prop({ default: 'store' })
  posChannel: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customer?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  cashier: Types.ObjectId;

  @Prop({
    type: {
      itemCount: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      discountTotal: { type: Number, default: 0 },
      taxTotal: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    required: true,
  })
  itemsSummary: {
    itemCount: number;
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
  };

  @Prop({ required: true, min: 0 })
  paidAmount: number;

  @Prop({ default: 0, min: 0 })
  changeAmount: number;

  @Prop({ enum: Object.values(PaymentMethod), default: PaymentMethod.CASH })
  paymentMethod: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Promotion' }] })
  promotionIds?: Types.ObjectId[];

  @Prop({
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.COMPLETED,
  })
  status: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
InvoiceSchema.index({ code: 1 }, { unique: true });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ cashier: 1 });
