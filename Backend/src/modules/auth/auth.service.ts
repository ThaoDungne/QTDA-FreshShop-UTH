import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = await this.adminService.findByUsername(username);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.adminService.validatePassword(
      password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password: _, ...result } = admin.toObject();
    return result;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.validateAdmin(
      loginDto.username,
      loginDto.password,
    );

    const payload = {
      username: admin.username,
      sub: admin._id,
      role: admin.role,
    };

    const access_token = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000); // 70 days

    // Save refresh token to admin
    await this.adminService.update(admin._id, {
      refreshToken,
      refreshTokenExpires,
    });

    return {
      access_token,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      refresh_expires_in: 7 * 24 * 60 * 60, // 7 days
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isActive: admin.isActive,
      },
    };
  }

  async validateToken(payload: any): Promise<any> {
    console.log('AuthService - validateToken called with payload:', payload);
    console.log('AuthService - Looking for admin with ID:', payload.sub);

    const admin = await this.adminService.findOne(payload.sub);
    console.log('AuthService - Admin found:', admin ? 'Yes' : 'No');
    console.log('AuthService - Admin isActive:', admin?.isActive);

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    return admin;
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refresh_token } = refreshTokenDto;

    // Find admin by refresh token
    const admin = await this.adminService.findByRefreshToken(refresh_token);

    if (!admin) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (admin.refreshTokenExpires && admin.refreshTokenExpires < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Generate new access token
    const payload = {
      username: admin.username,
      sub: admin._id,
      role: admin.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
    };
  }

  async logout(adminId: string): Promise<void> {
    // Clear refresh token
    await this.adminService.update(adminId, {
      refreshToken: undefined,
      refreshTokenExpires: undefined,
    });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
