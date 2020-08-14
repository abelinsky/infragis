import { Controller } from '@/core/presentation/controller';
import {
  HttpRequest,
  HttpResponse,
  badRequest,
  ok,
} from '@/core/presentation';
import { CreateUserDTO } from '@/data/dtos/create-user-dto';
import { CreateUserUseCase } from '@/usecases/createUser';
import { BadRequestError } from '@infragis/common';
import jwt from 'jsonwebtoken';

export class SignUpController implements Controller {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const userDto = httpRequest.body as CreateUserDTO;

    const a = 0;
    console.log('*** DELETE ME');
    userDto.email = 'asdasd';

    const result = await this.createUserUseCase.execute(userDto);
    if (!result.isSuccess()) {
      return badRequest(new BadRequestError(result.getError()));
    }

    // TODO: Change on something like this.authentication.auth with Passport.js...
    // const user = result.getValue().user;
    // Create JWT
    // const userJwt = jwt.sign(
    //   {
    //     id: user.props.email,
    //     email: user.props.password,
    //   },
    //   process.env.JWT_KEY!
    // );

    // Store JWT in session objects
    // req.session = {
    //   jwt: userJwt,
    // };

    // TODO: return auth results in the form like below instead of result.getValue()
    // export type AuthenticationModel = {
    //   accessToken: string
    //   name: string
    // }

    return ok(result.getValue(), 201);
  }
}
