import * as dotenv from 'dotenv';

export abstract class Config {
  config: Record<string, string> = {};
  private parsed: Record<string, string> = {};

  constructor(namespace: string, dotenvName?: string) {
    const { parsed } = dotenv.config({
      path: dotenvName ? `.${dotenvName}.env` : '.env',
    });
    this.parsed = parsed || {};
  }
}
