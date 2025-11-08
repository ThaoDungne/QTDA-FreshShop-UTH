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
    // Check if phone already exists
    const existingCustomer = await this.customerModel.findOne({
      phone: createCustomerDto.phone,
      deletedAt: null,
    });

    if (existingCustomer) {
      throw new ConflictException('Phone number already exists');
    }

    const customer = new this.customerModel(createCustomerDto);
    return await customer.save();
  }

  async findAll(): Promise<CustomerDocument[]> {
    return await this.customerModel.find({ deletedAt: null });
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
