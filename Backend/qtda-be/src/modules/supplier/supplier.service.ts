import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from '../../schemas';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierDocument> {
    // Check if name already exists
    const existingSupplier = await this.supplierModel.findOne({
      name: createSupplierDto.name,
      deletedAt: null,
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier name already exists');
    }

    const supplier = new this.supplierModel(createSupplierDto);
    return await supplier.save();
  }

  async findAll(): Promise<SupplierDocument[]> {
    return await this.supplierModel.find({ deletedAt: null });
  }

  async findOne(id: string): Promise<SupplierDocument> {
    const supplier = await this.supplierModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierDocument> {
    const supplier = await this.findOne(id);

    // Check name uniqueness if updating name
    if (updateSupplierDto.name && updateSupplierDto.name !== supplier.name) {
      const existingSupplier = await this.supplierModel.findOne({
        name: updateSupplierDto.name,
        deletedAt: null,
        _id: { $ne: id },
      });

      if (existingSupplier) {
        throw new ConflictException('Supplier name already exists');
      }
    }

    Object.assign(supplier, updateSupplierDto);
    return await supplier.save();
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await supplier.softDelete();
  }

  async search(query: string): Promise<SupplierDocument[]> {
    return await this.supplierModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { contactName: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
      deletedAt: null,
    });
  }
}
