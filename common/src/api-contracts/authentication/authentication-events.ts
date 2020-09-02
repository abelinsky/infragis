/**
 * Domain event names in format 'service.aggregate.eventName'.
 */
export enum EventNames {
  // Session
  SignUpRequested = 'authentication.session.signUpRequested',

  // User
  UserCreated = 'authentication.user.userCreated',
}

/**
 * Session Aggregate events.
 */
export interface SignUpRequestedData {
  sessionId: string;
  userId: string;
  email: string;
  requestedAt: string;
}

/**
 * User Aggregate events.
 */
export interface UserCreatedData {
  id: string;
  email: string;
  createdAt: string;
  /**
   * Password exists and is processed only inside Authentication domain.
   * It is not sent in the notifications to other services.
   */
  password?: string;
}
