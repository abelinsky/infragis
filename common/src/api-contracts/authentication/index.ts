import { ApiService } from '../api.service';
import { Notification } from '../notification-message-decorator';
import { NotificationMessage } from '../notification-message';
import { NotificationTopics } from '../notification-topics';

export const AuthenticationCommandsService: ApiService = {
  proto: 'authentication-commands.proto',
  packageName: 'authentication',
  serviceName: 'AuthenticationCommands',
};

@Notification(NotificationTopics.AuthenticationSession)
export class AuthenticationNotificationMessage extends NotificationMessage {
  name = 'AuthenticationEvent';
  package = 'authentication';
  protofile = 'authentication-events.proto';
}

@Notification(NotificationTopics.AuthenticationUser)
export class UserNotificationMessage extends NotificationMessage {
  name = 'UserEvent';
  package = 'authentication';
  protofile = 'authentication-events.proto';
}

export * as AuthenticationCommands from './authentication-commands.contract';
export * as AuthenticationEvents from './authentication-domain-events';
