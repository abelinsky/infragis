import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';
// import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';

export class Password {
  static readonly minLength = 6;
  private constructor(private password: string) {
    if (this.password.length < Password.minLength)
      throw new InvalidPasswordLengthException(password);
  }

  static fromString(password: string): Password {
    return new Password(password);
  }

  async hash(): Promise<Password> {
    // const saltRounds = 10;
    // const salt = await bcrypt.genSalt(saltRounds);
    // const hashed = await bcrypt.hash(this.password, salt);

    try {
      const hashed = await argon2.hash(this.password);
      return Password.fromString(hashed);
    } catch (err) {
      throw err;
    }
  }

  async compare(planTextPassword: string): Promise<boolean> {
    // return await bcrypt.compare(planTextPassword, this.password);

    try {
      const result = await argon2.verify(this.password, planTextPassword);
      return result;
    } catch (err) {
      throw err;
    }
  }

  toString(): string {
    return this.password;
  }
}

class InvalidPasswordLengthException extends ServiceException {
  code = RpcStatus.INVALID_ARGUMENT;

  constructor(password: string) {
    super(`Password length must be equal or greater than ${Password.minLength},
    provided password is ${password.length} characters length; 
    `);
  }
}
