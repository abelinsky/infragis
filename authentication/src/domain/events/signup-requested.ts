import {
  IDomainEvent,
  DomainEvent,
  AuthenticationEvents,
  Email,
  SessionId,
  Timestamp,
} from '@infragis/common';
import { Session } from 'inspector';

@DomainEvent(AuthenticationEvents.EventNames.SignUpRequested)
export class SignUpRequested implements IDomainEvent {
  constructor(
    public readonly sessionId: SessionId,
    public readonly email: Email,
    public readonly password: string,
    public readonly requestedAt: Timestamp
  ) {}

  serialize(): AuthenticationEvents.SignUpRequestedData {
    return {
      sessionId: this.sessionId.toString(),
      email: this.email.toString(),
      password: this.password,
      requestedAt: this.requestedAt.toString(),
    };
  }

  static deserialize({
    sessionId,
    email,
    password,
    requestedAt,
  }: AuthenticationEvents.SignUpRequestedData) {
    return new SignUpRequested(
      SessionId.fromString(sessionId),
      Email.fromString(email),
      password,
      Timestamp.fromString(requestedAt)
    );
  }
}
