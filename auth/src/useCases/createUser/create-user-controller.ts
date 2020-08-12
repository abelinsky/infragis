import { Request, Response } from 'express';
import { BaseController } from '../../core/base-controller';
import { CreateUserDTO } from './create-user-dto';
// import { sanitize } from '../../utils/text-utils';
import { CreateUserUseCase } from './create-user-use-case';
import jwt from 'jsonwebtoken';

export class CreateUserController extends BaseController {
  constructor(private useCase: CreateUserUseCase) {
    super();
    Object.setPrototypeOf(this, CreateUserController.prototype);
  }

  protected async executeImpl(req: Request, res: Response): Promise<void> {
    let dto = req.body as CreateUserDTO;
    dto = {
      // email: sanitize(dto.email),
      email: dto.email,
      password: dto.password,
    };

    try {
      const result = await this.useCase.execute(dto);
      if (!result.isSuccess()) {
        return this.fail(result.error);
      }

      const user = result.data.user;

      // Create JWT
      const userJwt = jwt.sign(
        {
          id: user.props.email,
          email: user.props.password,
        },
        process.env.JWT_KEY!
      );

      // Store JWT in session objects
      req.session = {
        jwt: userJwt,
      };

      this.ok(res, result.data, 201);
    } catch (err) {
      this.fail(err);
    }
  }
}
