import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../../schemas';
import { CreateAdminDto, UpdateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminDocument> {
    // Check if username already exists
    const existingAdmin = await this.adminModel.findOne({
      username: createAdminDto.username,
      deletedAt: null,
    });

    if (existingAdmin) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const admin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    });

    return await admin.save();
  }

  async findAll(): Promise<AdminDocument[]> {
    return await this.adminModel.find({ deletedAt: null });
  }

  async findOne(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findOne({ _id: id, deletedAt: null });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async findByUsername(username: string): Promise<AdminDocument | null> {
    return await this.adminModel.findOne({ username, deletedAt: null });
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<AdminDocument> {
    const admin = await this.findOne(id);

    Object.assign(admin, updateAdminDto);
    return await admin.save();
  }

  async remove(id: string): Promise<void> {
    const admin = await this.findOne(id);
    await admin.softDelete();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<AdminDocument | null> {
    return await this.adminModel.findOne({
      refreshToken,
      deletedAt: null,
    });
  }
}
