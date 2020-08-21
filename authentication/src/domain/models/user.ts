import {
  Aggregate,
  UserId,
  Email,
  Timestamp,
  StoredEvent,
  StoredSnapshot,
  ApplyDomainEvent,
  Password,
} from '@infragis/common';
import { UserCreated } from '../events';

export interface SerializedUser {
  id: string;
  email: string;
  password: string;
  createdAt: string;
}

export class User extends Aggregate<SerializedUser> {
  protected id: UserId;
  private email: Email;
  private password: Password;
  private createdAt: Timestamp;

  protected serialize(): SerializedUser {
    return {
      id: this.id.toString(),
      email: this.email.toString(),
      password: this.password.toString(),
      createdAt: this.createdAt.toString(),
    };
  }

  protected deserialize(data: SerializedUser): void {
    this.id = UserId.fromString(data.id);
    this.email = Email.fromString(data.email);
    this.password = Password.fromString(data.password);
    this.createdAt = Timestamp.fromString(data.createdAt);
  }

  static buildFrom(events: StoredEvent[], snapshot: StoredSnapshot<SerializedUser>): User {
    const user = new User();
    if (snapshot) {
      user.applySnapshot(snapshot, events);
    } else {
      user.replayEvents(events);
    }
    return user;
  }

  static create(id: UserId, email: Email, encryptedPassword: Password, createdAt: Timestamp): User {
    const user = new User();
    user.apply(new UserCreated(id, email, encryptedPassword, createdAt));
    return user;
  }

  @ApplyDomainEvent(UserCreated)
  protected created(event: UserCreated) {
    this.id = event.userId;
    this.email = event.email;
    this.password = event.password;
    this.createdAt = event.createdAt;
  }
}
