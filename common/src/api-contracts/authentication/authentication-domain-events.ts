import { EventTopics } from '../api-event-topics';

/**
 * Event names in format 'service.aggregate.eventName'.
 */
export enum EventNames {
  SignUpRequested = 'authentication.session.signUpRequested',
  UserCreated = 'authentication.user.created',
}

// Events Data
export interface UserCreatedData {
  id: string;
  email: string;
  encryptedPassword: string;
  createdAt: string;
}

export interface SignUpRequestedData {
  sessionId: string;
  userId: string;
  email: string;
  requestedAt: string;
}
