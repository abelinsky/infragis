export interface IConfig {
  get: (identifier: string, alternative?: string) => string;
  getNumber: (identifier: string, alternative?: number) => number;
  getArray: (identifier: string, alternative?: string[]) => string[];
  identifiers: string[];
}
