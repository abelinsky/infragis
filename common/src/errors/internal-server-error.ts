import { CustomError } from './custom-error';

export class InternalServerError extends CustomError {
  statusCode = 500;
  reason = 'Unexpected internal server error';

  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: `${this.reason}: ${this.message}`,
      },
    ];
  }
}
