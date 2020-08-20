import { Aggregate, SessionId, Email, Timestamp } from '@infragis/common';
import { SignUpRequested } from '../events/signup-requested';

export class SerializedSession {
  id: string;
}

export class Session extends Aggregate<SerializedSession> {
  protected id: SessionId;

  protected serialize(): SerializedSession {
    return {
      id: this.id.toString(),
    };
  }

  protected deserialize(data: SerializedSession): void {
    this.id = SessionId.fromString(data.id);
  }

  static emailSignUp(sessionId: SessionId, email: Email, password: string, requestedAt: Timestamp) {
    const session = new Session();
    session.apply(new SignUpRequested(sessionId, email, password, requestedAt));
    return session;
  }
}
