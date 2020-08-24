import {
  AuthenticationEvents,
  DomainEvent,
  Email,
  IDomainEvent,
  SessionId,
  Timestamp,
  UserId,
} from '@infragis/common';
import { Session } from 'inspector';

@DomainEvent(AuthenticationEvents.EventNames.SignUpRequested)
export class SignUpRequested implements IDomainEvent {
  constructor(
    public readonly sessionId: SessionId,
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly requestedAt: Timestamp
  ) {}

  serialize(): AuthenticationEvents.SignUpRequestedData {
    return {
      sessionId: this.sessionId.toString(),
      userId: this.userId.toString(),
      email: this.email.toString(),
      requestedAt: this.requestedAt.toString(),
    };
  }

  static deserialize({
    sessionId,
    userId,
    email,
    requestedAt,
  }: AuthenticationEvents.SignUpRequestedData) {
    return new SignUpRequested(
      SessionId.fromString(sessionId),
      UserId.fromString(userId),
      Email.fromString(email),
      Timestamp.fromString(requestedAt)
    );
  }
}
