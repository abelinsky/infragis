import {
  AuthenticationEvents,
  EventName,
  NotificationHandler,
  OnNotification,
  StoredEvent,
} from '@infragis/common';
import { injectable } from 'inversify';

@injectable()
export class InboundNotificationHandler extends NotificationHandler {
  consumerGroup = 'user.inbound.listeners';

  @OnNotification(AuthenticationEvents.EventNames.UserCreated)
  onUserCreated(event: StoredEvent<AuthenticationEvents.UserCreatedData>): void {
    this.logger.debug(
      `InboundNotificationHandler: Received event from ${EventName.fromString(event.name)} ` +
        `with payload: ${JSON.stringify(event.data)}`
    );
  }

  @OnNotification(AuthenticationEvents.EventNames.SignUpRequested)
  onSignUpRequested(event: StoredEvent<AuthenticationEvents.SignUpRequestedData>): void {
    this.logger.debug(
      `InboundNotificationHandler: Received event from ${EventName.fromString(event.name)}` +
        `with payload: ${JSON.stringify(event.data)}`
    );
  }
}
