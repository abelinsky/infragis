import { EventName } from '../../types';
import { NotificationHandler } from './notification-handler';

export const NOTIFICATIONS_HANDLER_TOPICS = '__NOTIFICATIONS_HANDLER_TOPICS__';

/**
 * Decorator for methods inside the descendants of {@link NotificationHandler} class.
 */
export const OnNotification = (domainEventName: string): MethodDecorator => {
  return function OnNotificationDecorator(
    target: any,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    if (!(target instanceof NotificationHandler)) {
      throw new Error(
        `@OnNotification can only be applied in NotificationHandler descendants, but ${target} does not extend it`
      );
    }
    const eventName = EventName.fromString(domainEventName);
    Reflect.defineMetadata(eventName.toString(), propertyKey, target);

    const topic = eventName.getTopic();

    const topics: string[] = Reflect.getMetadata(NOTIFICATIONS_HANDLER_TOPICS, target) || [];
    const newTopics = topics.includes(topic) ? topics : [...topics, topic];
    Reflect.defineMetadata(NOTIFICATIONS_HANDLER_TOPICS, newTopics, target);
  };
};
