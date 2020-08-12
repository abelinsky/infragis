import { User } from '../domain/user';

export interface IUserRepo {
  exists(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
}
