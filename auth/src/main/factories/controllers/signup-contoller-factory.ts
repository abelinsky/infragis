import { CreateUserUseCase } from '@/usecases/createUser/create-user-use-case';
import { sequelizeUserRepo } from '@/main/factories/repos';
import { Controller } from '@/core/presentation';
import { SignUpController } from '@/presentation/controllers/signup/signup-controller';

export const createSignUpController = (): Controller => {
  const createUserUseCase = new CreateUserUseCase(sequelizeUserRepo);
  return new SignUpController(createUserUseCase);
};
