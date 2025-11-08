import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor() {
    super();
  }

  async validate(req: any): Promise<any> {
    // In Node.js, all header keys are lowercased
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.API_KEY || 'freshshop@2025';

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    if (!expectedApiKey) {
      throw new UnauthorizedException('API Key not configured');
    }

    if (apiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Do not override req.user here; just signal success
    return true;
  }
}
