import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto/auth.dto';
import { ApiKeyOnly } from '../../common/decorators/auth-mode.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiKeyOnly()
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Admin login',
    description:
      'Authenticate admin with username and password, returns JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Get admin profile',
    description: 'Get current authenticated admin profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(@Request() req) {
    return {
      id: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };
  }

  @Get('_debug_me')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Debug JWT guard',
    description: 'Return current JWT user; helps diagnose 401 reasons',
  })
  async debugJwt(@Request() req) {
    return { user: req.user };
  }

  @Post('refresh')
  @ApiKeyOnly()
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Admin logout',
    description: 'Logout current admin and invalidate refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logout(@Request() req) {
    const adminId = (req.user && (req.user.sub || req.user.userId)) as string;
    await this.authService.logout(adminId);
    return {
      message: 'Logout successful',
      admin: req.user.username,
    };
  }
}
