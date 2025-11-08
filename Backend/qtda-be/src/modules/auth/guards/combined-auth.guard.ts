import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  AUTH_MODE_KEY,
  API_KEY_AND_JWT,
  API_KEY_ONLY,
  AuthMode,
} from '../../../common/constants/constants';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const mode =
      this.reflector.get<AuthMode>(AUTH_MODE_KEY, context.getHandler()) ??
      this.reflector.get<AuthMode>(AUTH_MODE_KEY, context.getClass()) ??
      API_KEY_AND_JWT;

    if (context.getType<'http'>() === 'http') {
      const req: Request = context.switchToHttp().getRequest();

      const apiKey =
        req.header('X-API-Key') || (req.query['api_key'] as string);
      if (!apiKey || apiKey !== process.env.API_KEY) {
        throw new UnauthorizedException('Invalid or missing API key');
      }

      if (mode === API_KEY_ONLY) return true;

      const auth = req.header('Authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) throw new UnauthorizedException('Missing Bearer token');

      try {
        const payload = this.jwt.verify(token, {
          secret: process.env.JWT_SECRET!,
          algorithms: ['HS256'],
        });
        (req as any).user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired JWT');
      }
    }

    throw new UnauthorizedException('Unsupported transport for auth guard');
  }
}
