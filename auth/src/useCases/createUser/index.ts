import { CreateUserController } from './create-user-controller';
import { CreateUserUseCase } from './create-user-use-case';
import { sequelizeUserRepo } from '@/repos';

const createUserUseCase = new CreateUserUseCase(sequelizeUserRepo);
const createUserController = new CreateUserController(createUserUseCase);

export { createUserController };
