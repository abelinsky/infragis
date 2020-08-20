import { v4 as uuidv4 } from 'uuid';
import shortid from 'shortid';
import { ServiceException } from '../exceptions';
import { RpcStatus } from '../rpc';

export type Id = UUId | ShortId;

abstract class BaseId {
  protected constructor(protected readonly id: string) {}

  equals(that?: Id): boolean {
    if (!that) return false;
    if (!(that instanceof this.constructor)) return false;

    return that.toString() === this.id;
  }

  toString(): string {
    return this.id;
  }
}

export class UUId extends BaseId {
  protected static check = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

  static generate(): UUId {
    return new UUId(uuidv4());
  }

  static fromString(id: string): UUId {
    if (!UUId.check.test(id)) throw new InvalidIdentifier(id);
    return new UUId(id);
  }
}

export class ShortId extends BaseId {
  static generate(): ShortId {
    return new ShortId(shortid());
  }

  static fromString(id: string) {
    if (!shortid.isValid(id)) throw new InvalidIdentifier(id);
    return new ShortId(id);
  }
}

export class InvalidIdentifier extends ServiceException {
  code = RpcStatus.INVALID_ARGUMENT;

  constructor(id: string) {
    super(`Id ${id} is not valid`);
  }
}
