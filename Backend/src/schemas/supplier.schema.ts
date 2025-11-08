import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  contactName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  taxCode?: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

// Indexes
SupplierSchema.index({ name: 1 }, { unique: true });
SupplierSchema.index(
  { deletedAt: 1 },
  { partialFilterExpression: { deletedAt: null } },
);

// Soft delete method
SupplierSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};
