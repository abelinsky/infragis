import { Observable } from 'rxjs';
import { StoredEvent } from '../core';

/**
 * Iterface for consumer of messages from event-bus.
 */
export interface INotificationConsumer {
  /**
   * Id of the consumer, useful for debugging purposes.
   */
  id: string;

  /**
   * Returns the status of the connection to event-bus.
   */
  isConnected(): boolean;

  /**
   * Disconnects consumer from event-bus, stops receiving messages.
   */
  disconnect(): Promise<boolean>;

  /**
   * Returns the observable to message stream.
   * @param topic Topic to listen to.
   * @param consumerGroup Group of message receivers.
   * @returns {@link Observable} instance.
   */
  getListener(topic: string | RegExp, consumerGroup: string): Observable<StoredEvent>;
}

export const NOTIFICATION_CONSUMER = Symbol.for('__INotificationConsumer__');
