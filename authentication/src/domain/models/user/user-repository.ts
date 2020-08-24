import { StoredEvent } from '@infragis/common';
import { User } from '..';
import { UserId } from '@infragis/common';

export interface UserRepository {
  /**
   * Gets Id for given email.
   * @param email User's email.
   */
  getId(email: string): Promise<UserId | undefined>;

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
