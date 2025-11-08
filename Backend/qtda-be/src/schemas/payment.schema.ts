import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod } from '../common/enums';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true })
  invoice: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ enum: Object.values(PaymentMethod), default: PaymentMethod.CASH })
  method: string;

  @Prop({ default: Date.now })
  paidAt: Date;

  @Prop({ trim: true })
  note?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ invoice: 1 });
PaymentSchema.index({ paidAt: -1 });
