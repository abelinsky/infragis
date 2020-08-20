export interface IDomainEvent {
  serialize(): Record<any, any>;
}

export type DomainEventClass<T extends IDomainEvent> = T;

export const EVENT_NAME_METADATA = Symbol('__EventName__');

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
