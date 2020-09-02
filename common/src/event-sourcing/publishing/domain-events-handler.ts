import { injectable, inject, postConstruct } from 'inversify';
import { Unsubscribable } from 'rxjs';
import { Class } from 'utility-types';
import { IDomainEventsListener } from './domain-events-listener';
import { DomainEventClass, EVENT_NAME_METADATA, StoredEvent, Aggregate } from '../core';
import { EventName } from '../../types';
import { DOMAIN_EVENTS_LISTENER } from '../../dependency-injection';

export const DOMAIN_EVENT_HANDLER_TOPICS = '__DOMAIN_EVENT_HANDLER_TOPICS__';

@injectable()
export abstract class DomainEventsHandler {
  @inject(DOMAIN_EVENTS_LISTENER)
  private eventsListener!: IDomainEventsListener;

  private subscription: Unsubscribable | undefined = undefined;
  /**
   * If defined, this handler will listen to the events in this type of aggregates.
   */
  abstract aggregateClass: Class<Aggregate> | undefined;

  private getTopics(): string[] {
    const topics: string[] = Reflect.getMetadata(DOMAIN_EVENT_HANDLER_TOPICS, this) || [];
    if (!topics.length) {
      throw new Error(
        `Class ${this.constructor.name} does not have methods decorated with @OnDomainEvent, please implement them.`
      );
    }
    return topics;
  }

  @postConstruct()
  initialize() {
    // Will listen to topics that the Handler is interested in due to the
    // set of the @OnDomainEvent methods inside it
    const topics = this.getTopics();
    const regex = new RegExp(topics.join('|'), 'i');

    this.subscription = this.eventsListener
      .getListener(regex)
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

    // Remember topics that the Projector is listening to. This metadata is used
    // in `getTopics` method of the Projector class.
    const topic = eventName.getTopic();
    const topics: string[] = Reflect.getMetadata(DOMAIN_EVENT_HANDLER_TOPICS, target) || [];
    const newTopics = topics.includes(topic) ? topics : [...topics, topic];
    Reflect.defineMetadata(DOMAIN_EVENT_HANDLER_TOPICS, newTopics, target);
  };
};
