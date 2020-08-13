import { UseCase } from '@/core/use-case';
import { CreateUserDTO } from './create-user-dto';
import { IUserRepo } from '@/repos/userRepo';
import { BadRequestError } from '@infragis/common';
import { User } from '@/domain/user';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserResults {
  user: User;
}

export class CreateUserUseCase extends UseCase<
  CreateUserDTO,
  CreateUserResults
> {
  constructor(private userRepo: IUserRepo) {
    super();
    Object.setPrototypeOf(this, CreateUserUseCase.prototype);
  }

  protected async executeImpl(
    params: CreateUserDTO
  ): Promise<CreateUserResults> {
    const { email, password } = params;

    const exists = await this.userRepo.exists(email);

    if (exists) {
      throw new BadRequestError('Email in use');
    }

    const user = User.create({ id: uuidv4(), email, password });

    await this.userRepo.save(user);

    return { user };
  }
}
