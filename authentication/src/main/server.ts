import { AUTHENTICATION_CONFIG } from '@/main/config';
import {
  GetEvents,
  RPC_SERVER_FACTORY,
  RpcHandler,
  RpcServer,
  RpcServerFactory,
  ServiceServer,
  StoredEvent,
} from '@infragis/common';
import { GLOBAL_CONFIG, IConfig, ILogger, LOGGER_TYPE } from '@infragis/common';
import { AuthenticationCommands, AuthenticationCommandsService } from '@infragis/common';
import { IUseCase } from '@infragis/common';
import { inject, injectable } from 'inversify';
import { EmailSignUp } from '../application';

@injectable()
export class AuthenticationServer extends ServiceServer implements AuthenticationCommands.Service {
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
    @inject(RPC_SERVER_FACTORY) private rpcServerFactory: RpcServerFactory
  ) {
    super();
  }

  @RpcHandler(AuthenticationCommandsService)
  async getEvents(payload: GetEvents): Promise<{ events: StoredEvent[] }> {
    return new Promise((resolve, _reject) => {
      resolve({ events: [] });
    });
  }

  @RpcHandler(AuthenticationCommandsService)
  async requestEmailSignUp(payload: AuthenticationCommands.RequestEmailSignUp): Promise<void> {
    await this.emailSignupUseCase.execute(payload);
  }

  async handleShutdown(): Promise<void> {
    await this.rpcServer.disconnect();
  }

  async healthcheck(): Promise<boolean> {
    return this.rpcServer.started;
  }

  // executeUseCase<T extends keyof AuthenticationCommands.Service>(useCaseName: T) {}

  // test(): void {
  //   this.executeUseCase('requestEmailSignUp');
  // }
}
