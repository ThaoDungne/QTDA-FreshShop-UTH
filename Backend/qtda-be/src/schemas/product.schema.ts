import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductStatus } from '../common/enums';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  sku?: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, trim: true })
  unit: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  expiryDays?: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplier?: Types.ObjectId;

  @Prop({ trim: true })
  barcode?: string;

  @Prop({ enum: Object.values(ProductStatus), default: ProductStatus.ACTIVE })
  status: string;

  @Prop({ type: Object })
  attributes?: {
    organic?: boolean;
    origin?: string;
    [key: string]: any;
  };

  @Prop({ default: null })
  deletedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ name: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index(
  { deletedAt: 1 },
  { partialFilterExpression: { deletedAt: null } },
);

// Soft delete method
ProductSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};
