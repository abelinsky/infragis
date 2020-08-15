export interface ILogger {
  error: (err: Error | string) => void;
  info: (...text: string[]) => void;
  warn: (...text: string[]) => void;
}

export const LOGGER_TYPE = Symbol.for('ILogger');
