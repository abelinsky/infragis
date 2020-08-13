import { UniqueId } from './unique-id';

const isEntity = (v: unknown): v is Entity<unknown> => {
  return v instanceof Entity;
};

export abstract class Entity<T> {
  constructor(
    protected readonly _id: UniqueId,
    public readonly props: T
  ) {}

  public equals(object?: Entity<T>): boolean {
    if (!object) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id.equals(object._id);
  }
}
