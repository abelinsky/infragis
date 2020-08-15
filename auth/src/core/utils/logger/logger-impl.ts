import { injectable } from 'inversify';

import { ILogger } from './ilogger';

@injectable()
export class Logger implements ILogger {
  constructor() {
    this.info('LOGGER CREATED');
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
