import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  IsEmail,
} from 'class-validator';
import { Gender } from '../../../common/enums';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer full name', example: 'Nguyễn Thị Lan' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number', example: '0901234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.FEMALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Birth date', example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Loyalty tier', example: 'Gold' })
  @IsOptional()
  @IsString()
  loyaltyTier?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'VIP customer' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Birth date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Loyalty tier' })
  @IsOptional()
  @IsString()
  loyaltyTier?: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class AdjustLoyaltyPointsDto {
  @ApiProperty({
    description: 'Points to adjust (positive to add, negative to subtract)',
    example: 100,
  })
  @IsNumber()
  points: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Manual adjustment',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;
}
