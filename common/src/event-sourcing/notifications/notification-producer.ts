import { StoredEvent } from '../core/stored-event';
import { Kafka } from 'kafkajs';

/**
 * Forwards events to Message Queue for delivering
 * to Remote Subscribers.
 */
export interface INotificationProducer {
  /**
   * Returns the status of the connection to event-bus.
   */
  isConnected(): boolean;

  /**
   * Disconnects producer from event-bus, stops producing messages.
   */
  disconnect(): Promise<boolean>;

  /**
   * Asynchronously sends notifications to the event bus about domain events that have occurred
   * and persisted in event store.
   * @param topic Topic to send event to.
   * @param events Events obtained from {@link DomainEvent}.
   */
  publishNotifications(topic: string, events: StoredEvent[]): Promise<void>;
}

export const NOTIFICATION_PRODUCER = Symbol.for('__INotificationProducer__');
