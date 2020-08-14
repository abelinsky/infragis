import { UniqueId } from '@/core/domain/unique-id';

export class IDomainEvent<T> {
  readonly emitterId: UniqueId;
  readonly data: T;
  readonly createdAt: Date;

  public constructor(emitterId: UniqueId, data: T) {
    this.emitterId = emitterId;
    this.data = data;
    this.createdAt = new Date();
  }
}
