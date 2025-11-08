import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';

export enum ReportPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class RevenueReportDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Group by period',
    enum: ReportPeriod,
    default: ReportPeriod.DAY,
  })
  @IsOptional()
  @IsEnum(ReportPeriod)
  groupBy?: ReportPeriod;
}

export class TopProductsReportDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Number of top products', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Product category filter' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class LoyalCustomersReportDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Number of customers', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Minimum order count', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderCount?: number;

  @ApiPropertyOptional({ description: 'Minimum total spent', example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minTotalSpent?: number;
}

export class InventoryReportDto {
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
