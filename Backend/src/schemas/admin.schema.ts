import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ default: 'admin' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ default: null })
  refreshTokenExpires?: Date;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Indexes
AdminSchema.index({ username: 1 }, { unique: true });
AdminSchema.index(
  { deletedAt: 1 },
  { partialFilterExpression: { deletedAt: null } },
);

// Soft delete method
AdminSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};
