import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '../common/enums';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ enum: Object.values(Gender) })
  gender?: string;

  @Prop()
  birthDate?: Date;

  @Prop({ trim: true })
  address?: string;

  @Prop({ default: 0, min: 0 })
  loyaltyPoints: number;

  @Prop({ trim: true })
  loyaltyTier?: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes
CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ fullName: 'text', phone: 1 });
CustomerSchema.index(
  { deletedAt: 1 },
  { partialFilterExpression: { deletedAt: null } },
);

// Soft delete method
CustomerSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};
