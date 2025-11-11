import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsMongoId,
} from 'class-validator';
import { ProductStatus } from '../../../common/enums';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Rau muống' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'VEG-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Product category', example: 'leafy' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'bó' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Selling price', example: 12000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Expiry days', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expiryDays?: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsMongoId()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Barcode', example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Product status',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Product attributes',
    example: { organic: true, origin: 'Đà Lạt' },
  })
  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Product category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Selling price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Expiry days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expiryDays?: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsMongoId()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Barcode' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Product status' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Product attributes' })
  @IsOptional()
  attributes?: Record<string, any>;
}
