import { UseCase } from '@/core/usecases/use-case';
import { CreateUserDTO } from '../../data/dtos/create-user-dto';
import { IUserRepo } from '@/data/repos/user-repo';
import { BadRequestError } from '@infragis/common';
import { User } from '@/domain/models/user';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserResponse } from './create-user-response';

export class CreateUserUseCase extends UseCase<
  CreateUserDTO,
  CreateUserResponse
> {
  constructor(private userRepo: IUserRepo) {
    super();
    Object.setPrototypeOf(this, CreateUserUseCase.prototype);
  }

  protected async executeImpl(
    params: CreateUserDTO
  ): Promise<CreateUserResponse> {
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
