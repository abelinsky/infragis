import { v4 as uuidv4 } from 'uuid';

export class UniqueId {
  private readonly _value: string;

  constructor(id?: string) {
    this._value = id ? id : uuidv4();
  }

  equals(id?: UniqueId): boolean {
    if (!id) {
      return false;
    }
    if (!(id instanceof this.constructor)) {
      return false;
    }
    return id._value === this._value;
  }

  get value(): string {
    return this._value;
  }
}
