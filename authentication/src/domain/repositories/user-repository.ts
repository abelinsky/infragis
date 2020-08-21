import { User } from '../models';

export interface UserRepository {
  /**
   * Asynchronously returns user with a given email.
   * @param email User's unique email.
   * @returns @param User instance.
   */
  getByEmail(email: string): Promise<User | undefined>;

  /**
   * Stores user's snapshot and events.
   * @param user @param User instance to be stored.
   */
  store(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol.for('__UserRepository__');
