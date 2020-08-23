import { injectable } from 'inversify';

import { ILogger } from './contracts/ilogger';

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
