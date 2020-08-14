import { User } from '@/domain/models/user';

export interface IUserRepo {
  exists(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
}
