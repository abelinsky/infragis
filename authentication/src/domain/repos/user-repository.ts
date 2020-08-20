import { User } from '../models';

export interface UserRepository {
  getByEmail(email: string): Promise<User>;
}

export const USER_REPOSITORY = Symbol.for('__UserRepository__');
