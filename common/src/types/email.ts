import sanitize from 'sanitize-html';
import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

const EMAIL_REGEX = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

export class Email {
  private constructor(private email: string) {
    this.email = sanitize(this.email);
    if (!EMAIL_REGEX.test(this.email)) throw new InvalidEmailException(email);
  }

  static fromString(email: string): Email {
    return new Email(email);
  }

  toString(): string {
    return this.email;
  }
}

class InvalidEmailException extends ServiceException {
  code = RpcStatus.INVALID_ARGUMENT;

  constructor(email: string) {
    super(`${email} is not a valid email address`);
  }
}
