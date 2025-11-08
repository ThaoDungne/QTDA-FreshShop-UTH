import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ description: 'Admin username', example: 'admin' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'Admin password', example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Full name', example: 'System Administrator' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'admin@freshshop.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '0373456789' })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;
}

export class UpdateAdminDto {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Refresh token (internal use)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Refresh token expiration (internal use)',
  })
  @IsOptional()
  refreshTokenExpires?: Date;
}

export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password', example: 'admin123' })
  @IsString()
  password: string;
}
