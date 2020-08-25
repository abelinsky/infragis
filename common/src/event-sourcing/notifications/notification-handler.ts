import { injectable, inject, postConstruct } from 'inversify';
import { Unsubscribable } from 'rxjs';
import { StoredEvent } from '../core';
import { NOTIFICATION_CONSUMER, INotificationConsumer } from './notification-consumer';
import { NOTIFICATIONS_HANDLER_TOPICS } from './on-notification';

@injectable()
export abstract class NotificationHandler {
  abstract consumerGroup: string;

  @inject(NOTIFICATION_CONSUMER) private notificationConsumer!: INotificationConsumer;
  private subscription: Unsubscribable | undefined = undefined;

  @postConstruct()
  initialize() {
    const topics: string[] = Reflect.getMetadata(NOTIFICATIONS_HANDLER_TOPICS, this);
    const regex = new RegExp(topics.join('|'));
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

  private handleEvent = async (event: StoredEvent): Promise<void> => {
    const handlerName = Reflect.getMetadata(event.name, this);
    if (!handlerName) return;
    // TODO: Handle errors from handler or not?
    await (this as any)[handlerName](event);
  };
}
