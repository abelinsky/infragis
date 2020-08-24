import {
  IDomainEvent,
  UserId,
  Email,
  Timestamp,
  AuthenticationEvents,
  DomainEvent,
  Password,
} from '@infragis/common';

@DomainEvent(AuthenticationEvents.EventNames.UserCreated)
export class UserCreated implements IDomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly password: Password,
    public readonly createdAt: Timestamp
  ) {}

  serialize(): AuthenticationEvents.UserCreatedData {
    return {
      id: this.userId.toString(),
      email: this.email.toString(),
      encryptedPassword: this.password.toString(),
      createdAt: this.createdAt.toString(),
    };
  }

  static deserialize({
    id,
    email,
    encryptedPassword,
    createdAt,
  }: AuthenticationEvents.UserCreatedData) {
    return new UserCreated(
      UserId.fromString(id),
      Email.fromString(email),
      Password.fromString(encryptedPassword),
      Timestamp.fromString(createdAt)
    );
  }
}
