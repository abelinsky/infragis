import { StoredEvent } from '@infragis/common';
import { User } from '../models';
import { UserId } from '@infragis/common';

export interface UserRepository {
  /**
   * Checks whether the user exists.
   * @param email User's unique email.
   * @returns @param User instance.
   */
  userExists(email: string): Promise<boolean>;

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
