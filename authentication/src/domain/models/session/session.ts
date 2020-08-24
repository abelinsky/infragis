import { Aggregate, SessionId, Email, Timestamp, UserId, ApplyDomainEvent } from '@infragis/common';
import { SignUpRequested } from './signup-requested';

export class SerializedSession {
  id: string;
  userId: string;
  signUpRequestedAt: string;
}

export class Session extends Aggregate<SerializedSession> {
  protected id: SessionId;
  private userId: UserId;
  private signUpRequestedAt: Timestamp;

  protected serialize(): SerializedSession {
    return {
      id: this.id.toString(),
      userId: this.userId.toString(),
      signUpRequestedAt: this.signUpRequestedAt.toString(),
    };
  }

  protected deserialize(data: SerializedSession): void {
    this.id = SessionId.fromString(data.id);
    this.userId = UserId.fromString(data.userId);
    this.signUpRequestedAt = Timestamp.fromString(data.signUpRequestedAt);
  }

  static emailSignUp(
    sessionId: SessionId,
    userId: UserId,
    email: Email,
    requestedAt: Timestamp
  ): Session {
    const session = new Session();
    session.apply(new SignUpRequested(sessionId, userId, email, requestedAt));
    return session;
  }

  @ApplyDomainEvent(SignUpRequested)
  signUpRequested(event: SignUpRequested): void {
    this.id = event.sessionId;
    this.userId = event.userId;
    this.signUpRequestedAt = event.requestedAt;
  }
}
