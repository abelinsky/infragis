import { injectable } from 'inversify';
import { BaseConfig } from './base-config';

export * from './contracts/iconfig';
export * from './base-config';
export * from './constants';

@injectable()
export class GlobalConfig extends BaseConfig {
  constructor() {
    super('global');
  }
}

@injectable()
export class SecretsConfig extends BaseConfig {
  constructor() {
    super('secrets');
  }
}
