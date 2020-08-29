import { injectable } from 'inversify';
import chalk from 'chalk';

export interface ILogger {
  error: (err: Error | string) => void;
  info: (...text: string[]) => void;
  warn: (...text: string[]) => void;
  debug: (...text: string[]) => void;
}

@injectable()
export class BaseLogger implements ILogger {
  private chalk = new chalk.Instance({ level: 1 });

  debug(...text: string[]): void {
    const msg = text.join('\r\n');
    console.log(this.chalk.cyanBright(`${msg}`));
  }

  error(err: string | Error): void {
    console.error(this.chalk.red.bold(`Error: ${err.toString()}`));
  }

  info(...text: string[]): void {
    const msg = text.join('\r\n');
    console.log(`${msg}`);
  }

  warn(...text: string[]): void {
    const msg = text.join('\r\n');
    console.log(this.chalk.magenta(`Warning: ${msg}`));
  }
}
