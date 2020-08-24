import { injectable } from 'inversify';

export interface ILogger {
  error: (err: Error | string) => void;
  info: (...text: string[]) => void;
  warn: (...text: string[]) => void;
  debug: (...text: string[]) => void;
}

export const LOGGER_TYPE = Symbol.for('ILogger');

@injectable()
export class BaseLogger implements ILogger {
  constructor() {
    this.info('LOGGER CREATED');
  }

  debug(...text: string[]): void {
    console.debug(text);
  }

  error(err: string | Error): void {
    console.error(err);
  }

  info(...text: string[]): void {
    console.log(text);
  }

  warn(...text: string[]): void {
    console.warn(text);
  }
}
