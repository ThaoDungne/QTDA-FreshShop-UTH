import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateInventoryLotDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity received', example: 100 })
  @IsNumber()
  @Min(0)
  quantityIn: number;

  @ApiProperty({ description: 'Cost per unit', example: 8000 })
  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsMongoId()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Received date', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @ApiPropertyOptional({
    description: 'Note',
    example: 'Fresh delivery from supplier',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateInventoryLotServiceDto {
  productId: string;
  quantityIn: number;
  costPerUnit: number;
  supplierId?: string;
  receivedDate?: Date;
  note?: string;
}

export class StockAdjustmentDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Specific lot ID' })
  @IsOptional()
  @IsMongoId()
  lotId?: string;

  @ApiProperty({
    description: 'Quantity to adjust (positive to add, negative to subtract)',
    example: 10,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Stock count correction',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class StockAdjustmentServiceDto {
  productId: string;
  lotId?: string;
  quantity: number;
  reason: string;
  note?: string;
  actorId: string;
}

export class StockQueryDto {
  @ApiPropertyOptional({ description: 'Low stock threshold', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Expiry warning days', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expiryWarningDays?: number;

  @ApiPropertyOptional({ description: 'Product category filter' })
  @IsOptional()
  @IsString()
  category?: string;
}
