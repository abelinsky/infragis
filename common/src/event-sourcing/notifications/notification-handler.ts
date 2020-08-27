import { inject, injectable, postConstruct } from 'inversify';
import { Unsubscribable } from 'rxjs';
import { PickByValue } from 'utility-types';

import { ILogger, LOGGER_TYPE } from '../../utils';
import { StoredEvent } from '../core';

import { INotificationConsumer, NOTIFICATION_CONSUMER } from './notification-consumer';
import { NOTIFICATIONS_HANDLER_TOPICS } from './on-notification';

/**
 * Base class for handling notification events.
 * @example
 *    class UserNotificationHandler extends NotificationHandler {
 *        consumerGroup = 'User';
 *
 *         @OnNotification(AuthenticationEvents.UserCreated)
 *         onUserCreated(data: UserCreatedData) {
 *            // do something
 *         }
 *    }
 */
@injectable()
export abstract class NotificationHandler {
  abstract consumerGroup: string;

  @inject(NOTIFICATION_CONSUMER)
  private notificationConsumer!: INotificationConsumer;
  @inject(LOGGER_TYPE) protected logger!: ILogger;

  private subscription: Unsubscribable | undefined = undefined;

  @postConstruct()
  initialize() {
    const topics: string[] = Reflect.getMetadata(NOTIFICATIONS_HANDLER_TOPICS, this) || [];
    if (!topics.length) {
      throw new Error(
        `Class ${this.constructor.name} does not have methods decorated with @OnNotification, please implement them`
      );
    }

    this.logger.debug(
      `${this.constructor.name} is listening to ${topics.join('|')} as a consumer group ${
        this.consumerGroup
      }`
    );

    const regex = new RegExp(topics.join('|'), 'i');
    this.subscription = this.notificationConsumer
      .getListener(regex, this.consumerGroup)
      .subscribe((e) => this.handleEvent(e));
  }

  get connected() {
    return !!this.subscription;
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
  }

  private async handleEvent(event: StoredEvent): Promise<void> {
    const handlerName = Reflect.getMetadata(event.name, this);

    if (!handlerName) {
      this.logger.debug(
        `Failed to handle method #${handlerName} of ${this.constructor.name} for event ${event.name}.`
      );
      return;
    }
    // TODO: Handle errors from handler or not?
    await (this as any)[handlerName](event);
  }
}
