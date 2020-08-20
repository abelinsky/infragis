import { DomainEventClass, EVENT_NAME_METADATA } from './domain-event';
import { Aggregate } from './aggregate';
import { EventName } from '../types';

export const ApplyDomainEvent = (Event: DomainEventClass<any>) => {
  return function ApplyDomainEventDecorator(
    target: any,
    methodName: string,
    _descriptor: PropertyDescriptor
  ) {
    if (!(target instanceof Aggregate)) {
      throw new Error(
        `@Apply() decorator cannot be used with ${target}, because it does not extend Aggregate class`
      );
    }
    // Get event's name from metadata
    const eventName = EventName.create(
      Reflect.getMetadata(EVENT_NAME_METADATA, Event.prototype)
    );
    // Save `methodName`. It is used in the method `applyDomainEvent`
    // of the Aggregate class
    Reflect.defineMetadata(eventName.toString(), methodName, target);
  };
};
