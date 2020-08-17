export interface ILogger {
  error: (err: Error | string) => void;
  info: (...text: string[]) => void;
  warn: (...text: string[]) => void;
}
