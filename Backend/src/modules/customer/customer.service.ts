import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../schemas';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  AdjustLoyaltyPointsDto,
} from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerDocument> {
    try {
      console.log('Creating customer with data:', createCustomerDto);
      
      // Check if phone already exists
      const existingCustomer = await this.customerModel.findOne({
        phone: createCustomerDto.phone,
        deletedAt: null,
      });

      if (existingCustomer) {
        throw new ConflictException('Phone number already exists');
      }

      // Prepare customer data - Mongoose will handle the conversion
      const customer = new this.customerModel({
        fullName: createCustomerDto.fullName,
        phone: createCustomerDto.phone,
        ...(createCustomerDto.email && { email: createCustomerDto.email }),
        ...(createCustomerDto.gender && { gender: createCustomerDto.gender }),
        ...(createCustomerDto.birthDate && {
          birthDate: new Date(createCustomerDto.birthDate),
        }),
        ...(createCustomerDto.address && { address: createCustomerDto.address }),
        ...(createCustomerDto.loyaltyTier && {
          loyaltyTier: createCustomerDto.loyaltyTier,
        }),
        ...(createCustomerDto.note && { note: createCustomerDto.note }),
      });
      const savedCustomer = await customer.save();
      console.log('Customer created successfully:', savedCustomer._id);
      return savedCustomer;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      // Handle validation errors
      if (error.name === 'ValidationError' && error.errors) {
        const messages = Object.values(error.errors).map(
          (err: { message?: string }) => err.message || 'Validation error'
        );
        throw new ConflictException(messages.join(', '));
      }
      // Handle duplicate key errors
      if (error.code === 11000) {
        throw new ConflictException('Phone number already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<CustomerDocument[]> {
    try {
      const customers = await this.customerModel
        .find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .exec();
      return customers;
    } catch (error: any) {
      console.error('Error in findAll customers:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CustomerDocument> {
    const customer = await this.customerModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async findByPhone(phone: string): Promise<CustomerDocument | null> {
    return await this.customerModel.findOne({ phone, deletedAt: null });
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    const customer = await this.findOne(id);

    Object.assign(customer, updateCustomerDto);
    return await customer.save();
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await customer.softDelete();
  }

  async adjustLoyaltyPoints(
    id: string,
    adjustDto: AdjustLoyaltyPointsDto,
  ): Promise<CustomerDocument> {
    const customer = await this.findOne(id);

    customer.loyaltyPoints += adjustDto.points;
    if (customer.loyaltyPoints < 0) {
      customer.loyaltyPoints = 0;
    }

    return await customer.save();
  }

  async search(query: string): Promise<CustomerDocument[]> {
    return await this.customerModel.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
      deletedAt: null,
    });
  }
}
