import { SetMetadata } from '@nestjs/common';
import { AUTH_MODE_KEY } from '../constants/constants';
import type { AuthMode } from '../constants/constants';

export const SetAuthMode = (mode: AuthMode) => SetMetadata(AUTH_MODE_KEY, mode);

export const ApiKeyOnly = () => SetAuthMode('API_KEY_ONLY');
export const ApiKeyAndJwt = () => SetAuthMode('API_KEY_AND_JWT');
