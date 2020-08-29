import { injectable, inject, postConstruct } from 'inversify';
import { Unsubscribable } from 'rxjs';
import { Class } from 'utility-types';
import { IDomainEventsListener } from './domain-events-listener';
import { DomainEventClass, EVENT_NAME_METADATA, StoredEvent, Aggregate } from '../core';
import { EventName } from '../../types';
import { DOMAIN_EVENTS_LISTENER } from '../../dependency-injection';

@injectable()
export abstract class DomainEventsHandler {
  @inject(DOMAIN_EVENTS_LISTENER) private eventsListener!: IDomainEventsListener;

  private subscription: Unsubscribable | undefined = undefined;
  /**
   * If defined, this handler will listen to the events in this type of aggregates.
   */
  abstract aggregateClass: Class<Aggregate> | undefined;

  @postConstruct()
  initialize() {
    this.subscription = this.eventsListener
      .getListener(this.aggregateClass)
      .subscribe((e) => this.handleEvent(e));
  }

  get connected() {
    return !!this.subscription;
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
  }

  private handleEvent = async (event: StoredEvent): Promise<void> => {
    const handlerName = Reflect.getMetadata(event.name, this);
    if (handlerName) {
      await (this as any)[handlerName](event);
    }
  };
}

/**
 * Decorator for handler methods.
 * @param Event Event Class.
 */
export const OnDomainEvent = (Event: DomainEventClass<any>): MethodDecorator => {
  return function OnDomainEventDecorator(
    target: any,
    methodName: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    if (!(target instanceof DomainEventsHandler)) {
      throw new Error(
        `@OnDomainEvent cannot be applied to ${target} because it does not extend DomainEventsHandler class.`
      );
    }

    const eventName = EventName.fromString(
      Reflect.getMetadata(EVENT_NAME_METADATA, Event.prototype)
    );

    // Save methodName. It is used in DomainEventListener to handle events.
    Reflect.defineMetadata(eventName.toString(), methodName, target);
  };
};
