import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PromotionType, PromotionScope } from '../common/enums';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ enum: Object.values(PromotionType), required: true })
  type: string;

  @Prop({ enum: Object.values(PromotionScope), required: true })
  scope: string;

  @Prop({ type: Object })
  conditions?: {
    minSubtotal?: number;
    categoryIn?: string[];
    productIn?: string[];
    [key: string]: any;
  };

  @Prop({ type: Object })
  effects?: {
    percent?: number;
    amount?: number;
    bonusPoints?: number;
    [key: string]: any;
  };

  @Prop()
  startAt?: Date;

  @Prop()
  endAt?: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

// Indexes
PromotionSchema.index({ active: 1 });
PromotionSchema.index({ startAt: 1, endAt: 1 });
