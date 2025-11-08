import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit price override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount per item', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @ApiProperty({ description: 'Cashier ID (Admin ID)' })
  @IsMongoId()
  cashierId: string;

  @ApiProperty({ description: 'Invoice items', type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ description: 'Payment method', example: 'cash' })
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'Amount paid', example: 50000 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiPropertyOptional({
    description: 'Promotion IDs to apply',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  promotionIds?: string[];

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class VoidInvoiceDto {
  @ApiProperty({
    description: 'Reason for voiding',
    example: 'Customer cancelled order',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Customer ID filter' })
  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Cashier ID filter' })
  @IsOptional()
  @IsMongoId()
  cashierId?: string;
}
