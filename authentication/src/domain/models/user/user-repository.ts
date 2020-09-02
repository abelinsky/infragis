import { AuthenticationQueryModel } from '@infragis/common';
import { User } from './user';

export interface UserRepository {
  /**
   * Gets User view (see {@link AuthenticationQueryModel.UserView})
   * by email.
   * @param email User's email.
   */
  getByEmail(email: string): Promise<AuthenticationQueryModel.UserView | undefined>;

  /**
   * Gets the stream of events for User class.
   * @param from Last event number.
   */
  // getEvents(from: number): Promise<StoredEvent[]>;

  /**
   * Stores user's snapshot and events.
   * @param user @param User instance to be stored.
   */
  store(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol.for('__UserRepository__');
