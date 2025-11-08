import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LoyaltyLedgerType } from '../common/enums';

export type LoyaltyLedgerDocument = LoyaltyLedger & Document;

@Schema({ timestamps: true })
export class LoyaltyLedger {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer: Types.ObjectId;

  @Prop({ enum: Object.values(LoyaltyLedgerType), required: true })
  type: string;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  refInvoice?: Types.ObjectId;

  @Prop({ required: true })
  balanceAfter: number;
}

export const LoyaltyLedgerSchema = SchemaFactory.createForClass(LoyaltyLedger);

// Indexes
LoyaltyLedgerSchema.index({ customer: 1, createdAt: -1 });
LoyaltyLedgerSchema.index({ refInvoice: 1 });
