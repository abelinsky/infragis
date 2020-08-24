import { injectable, inject } from 'inversify';
import {
  RpcServer,
  RpcHandler,
  RPC_SERVER_FACTORY,
  RpcServerFactory,
  GetEvents,
  StoredEvent,
  IProjector,
} from '@infragis/common';
import { IConfig, LOGGER_TYPE, GLOBAL_CONFIG, ILogger } from '@infragis/common';
import { AUTHENTICATION_CONFIG } from '@/main/config';
import { AuthenticationCommands, AuthenticationCommandsService } from '@infragis/common';
import { EmailSignUp } from '../application';
import { IUseCase } from '@infragis/common';
import { DOMESTIC_USER_PROJECTOR } from '@/infrastructure';

@injectable()
export class AuthenticationServer implements AuthenticationCommands.Service {
  private rpcServer: RpcServer = this.rpcServerFactory({
    services: [AuthenticationCommandsService],
    methodsHandlerInstance: this,
  });

  @inject(EmailSignUp.USECASE_NAME)
  private emailSignupUseCase: IUseCase<AuthenticationCommands.Service, EmailSignUp.ServiceMethod>;

  constructor(
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(AUTHENTICATION_CONFIG) private gatewayConfig: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger,
    @inject(RPC_SERVER_FACTORY) private rpcServerFactory: RpcServerFactory,
    @inject(DOMESTIC_USER_PROJECTOR) private userProjector: IProjector
  ) {}

  @RpcHandler(AuthenticationCommandsService)
  async getEvents(payload: GetEvents): Promise<{ events: StoredEvent[] }> {
    return new Promise((resolve, reject) => {
      resolve({ events: [] });
    });
  }

  @RpcHandler(AuthenticationCommandsService)
  async requestEmailSignUp(payload: AuthenticationCommands.RequestEmailSignUp): Promise<void> {
    await this.emailSignupUseCase.execute(payload);
  }
}
