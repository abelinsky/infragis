import { EventName } from '../../types';
import { Aggregate } from './aggregate';

/**
 * Case class for Domain Events. The implementation
 * must include static deserialize(data: T) method
 * in order to be used during replaying events from
 * the Event Store. @DomainEvent decorator is used
 * to define metadata for the particular domain event class
 * and @ApplyDomainEvent inside the Aggregate class is used
 * to automatically apply this event to the class instance.
 * This mechanism is primarily used to raise domain event inside
 * Aggregate and after it to apply this event and to change (mutate)
 * the aggregate's state. It helps to encapsulate mutation
 * logic and to keep track of the domain events stream.
 */
export interface IDomainEvent {
  /**
   * Serializes events. Primarily used when persisting
   * the event to the event store.
   */
  serialize(): Record<any, any>;

  /**
   * The implementation must include static deserialize(data: T) method.
   * Deserialize method returns event's data and is primarily used in
   * {@link Aggregate#replayEvents} method to reconstitute true {@link IDomainEvent}
   * instance from {@link StoredEvent} instance that was stored in the event store
   * mutate the state of the aggregate.
   */
}

/**
 * @DomainEvent decorator. See {@link IDomainEvent} docs.
 */
export type DomainEventClass<T extends IDomainEvent> = T;
export const EVENT_NAME_METADATA = Symbol('__DomainEventDecorator__');

export type DeserializeFunction = (data: any) => IDomainEvent;
export const eventDeserializer: Map<string, DeserializeFunction> = new Map();

export const DomainEvent = (eventName: string) => {
  return function DomainEventDecorator<T extends { new (...args: any[]): any }>(constructor: T) {
    Reflect.defineMetadata(EVENT_NAME_METADATA, eventName, constructor.prototype);
    const deserialize = (constructor as any).deserialize as DeserializeFunction;
    if (!deserialize) {
      throw new Error(`Domain event ${eventName} must have a static deserialize method.`);
    }
    eventDeserializer.set(eventName, deserialize);
  };
};

/**
 * @ApplyDomainEvent decorator. See {@link IDomainEvent} docs.
 */
export const ApplyDomainEvent = (Event: DomainEventClass<any>) => {
  return function ApplyDomainEventDecorator(
    target: any,
    methodName: string,
    _descriptor: PropertyDescriptor
  ) {
    if (!(target instanceof Aggregate)) {
      throw new Error(
        `@Apply() decorator cannot be used with ${target}, because it does not extend Aggregate class.`
      );
    }
    // Get event's name from metadata
    const eventName = EventName.fromString(
      Reflect.getMetadata(EVENT_NAME_METADATA, Event.prototype)
    );
    // Save `methodName`. It is used in the method `applyDomainEvent`
    // of the Aggregate class
    Reflect.defineMetadata(eventName.toString(), methodName, target);
  };
};
