import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Check if SKU already exists (if provided)
    if (createProductDto.sku) {
      const existingProduct = await this.productModel.findOne({
        sku: createProductDto.sku,
        deletedAt: null,
      });

      if (existingProduct) {
        throw new ConflictException('SKU already exists');
      }
    }

    const product = new this.productModel(createProductDto);
    return await product.save();
  }

  async findAll(): Promise<ProductDocument[]> {
    return await this.productModel.find({ deletedAt: null });
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByCategory(category: string): Promise<ProductDocument[]> {
    return await this.productModel.find({
      category,
      deletedAt: null,
      status: 'active',
    });
  }

  async findBySupplier(supplierId: string): Promise<ProductDocument[]> {
    const objectId = new Types.ObjectId(supplierId);
    return await this.productModel.find({
      supplier: objectId,
      deletedAt: null,
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);

    // Check SKU uniqueness if updating SKU
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productModel.findOne({
        sku: updateProductDto.sku,
        deletedAt: null,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new ConflictException('SKU already exists');
      }
    }

    Object.assign(product, updateProductDto);
    return await product.save();
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await product.softDelete();
  }

  async search(query: string): Promise<ProductDocument[]> {
    return await this.productModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
      ],
      deletedAt: null,
    });
  }

  async getActiveProducts(): Promise<ProductDocument[]> {
    return await this.productModel.find({
      deletedAt: null,
      status: 'active',
    });
  }
}
