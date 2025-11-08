import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  AdjustLoyaltyPointsDto,
} from './dto/customer.dto';

@ApiTags('Customer Management')
@Controller('customers')
@ApiSecurity('api-key')
@ApiBearerAuth('JWT-auth')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 409, description: 'Phone number already exists' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of all customers' })
  findAll() {
    return this.customerService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers' })
  @ApiQuery({
    name: 'q',
    description: 'Free text: name, phone, email',
    required: true,
    example: 'thanh 098',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page index (1-based)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort field',
    required: false,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order asc|desc',
    required: false,
    example: 'desc',
  })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.customerService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Patch(':id/loyalty-points')
  @ApiOperation({ summary: 'Adjust customer loyalty points' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty points adjusted successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  adjustLoyaltyPoints(
    @Param('id') id: string,
    @Body() adjustDto: AdjustLoyaltyPointsDto,
  ) {
    return this.customerService.adjustLoyaltyPoints(id, adjustDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer (soft delete)' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
