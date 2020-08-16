export interface IConfig {
  get: (identifier: string) => string;
  getNumber: (identifier: string) => number;
  getArray: (identifier: string) => string[];
  identifiers: string[];
}

export const GLOBAL_CONFIG_TYPE = Symbol.for('global');
