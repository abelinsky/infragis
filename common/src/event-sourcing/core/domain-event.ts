import { EventName } from '../../types';
import { Aggregate } from './aggregate';

export interface IDomainEvent {
  serialize(): Record<any, any>;
}

/**
 * @DomainEvent decorator.
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
 * @ApplyDomainEvent decorator.
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
