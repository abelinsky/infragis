import { Config } from '@/core/config';

export class AuthConfig extends Config {
  constructor() {
    super('auth');
  }
}

export const AUTH_CONFIG_TYPE = Symbol('AuthConfig');
