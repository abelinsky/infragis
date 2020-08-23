import { StoredEvent } from '../core/stored-event';

/**
 * Forwards events to Message Queue for delivering
 * to Remote Subscribers.
 */
export interface INotificationPublisher {
  publishNotifications(events: StoredEvent[]): Promise<void>;
}

export const NOTIFICATION_PUBLISHER = Symbol.for('__INotificationPublisher__');
