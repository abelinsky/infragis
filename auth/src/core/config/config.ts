import * as dotenv from 'dotenv';
import { IConfig } from './iconfig';
import { injectable } from 'inversify';

@injectable()
export abstract class Config implements IConfig {
  config: Record<string, string> = {};
  private parsed: Record<string, string> = {};

  private readonly importedKeysLabel = 'shared.imports';
  private readonly exportedKeysLabel = 'shared.exports';

  constructor(namespace: string, dotenvName?: string) {
    const { parsed } = dotenv.config({
      path: dotenvName ? `.${dotenvName}.env` : '.env',
    });
    this.parsed = parsed || {};

    const intenalKeys = this.keysStartingWith(`${namespace}.`);

    const importedKeys = this.getArrayFromEnv(
      `${namespace}.${this.importedKeysLabel}`
    );

    const externalKeys: string[] = [];
    importedKeys.forEach((name) => {
      const externalExportedKeys = this.getArrayFromEnv(
        `${name}.${this.exportedKeysLabel}`
      );
      externalKeys.push(
        ...externalExportedKeys.map((k) => `${name}.${k}`)
      );
    });

    this.setConfig(intenalKeys);
    this.setConfig(externalKeys);
  }

  get(identifier: string): string {
    const value = this.config[identifier] || this.getEnvVar(identifier);
    if (!value)
      throw new Error(`No config value with ${identifier} found.`);
    return value;
  }

  getNumber(identifier: string): number {
    const value = this.get(identifier);
    return Number(value);
  }

  getArray(identifier: string): string[] {
    const value = this.get(identifier);
    if (!value) return [];
    if (value.split(';').length) return value.split(';');
    return [value];
  }

  get identifiers(): string[] {
    return Object.keys(this.config);
  }

  private getArrayFromEnv(key: string): string[] {
    const env = this.getEnvVar(key);
    if (!env) {
      return [];
    }
    if (env.split(';').length) {
      return env.split(';');
    }
    return [env];
  }

  private keysStartingWith(starting: string): string[] {
    const allKeys = [
      ...Object.keys(this.parsed).filter((key) =>
        key.startsWith(starting)
      ),
      ...Object.keys(process.env).filter((key) =>
        key.startsWith(starting)
      ),
    ];
    return allKeys.filter((key, index) => index === allKeys.indexOf(key));
  }

  private getEnvVar(key: string): string {
    return this.parsed[key] || process.env[key] || '';
  }

  private setConfig(keys: string[]): void {
    keys.forEach((key) => {
      if (key.includes(this.importedKeysLabel)) return;
      if (key.includes(this.exportedKeysLabel)) return;

      this.config[key] = this.getEnvVar(key);
    });
  }
}
