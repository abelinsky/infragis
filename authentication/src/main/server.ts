import { AUTHENTICATION_CONFIG } from '@/main/config';
import {
  GetEvents,
  RPC_SERVER_FACTORY,
  RpcHandler,
  RpcServer,
  RpcServerFactory,
  ServiceServer,
  StoredEvent,
  DATABASE_FACTORY,
  DatabaseFactory,
} from '@infragis/common';
import { GLOBAL_CONFIG, SECRETS_CONFIG, IConfig, ILogger, LOGGER_TYPE } from '@infragis/common';
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

  private readonly databaseCredentials = {
    databaseHost: this.config.get('authentication.database.host'),
    databasePort: this.config.getNumber('authentication.database.port'),
    databaseName: this.config.get('authentication.database.name'),
    databaseUser: this.secretsConfig.get('secrets.authentication-database.user'),
    databasePassword: this.secretsConfig.get('secrets.authentication-database.password'),
  };

  // We call for initializing database here and keep the pointer to it
  // during the life of our service. The Database is Singleton so
  // it can be injected anywhere through `DATABASE` identifier.
  private database = this.databaseFactory({ ...this.databaseCredentials });

  constructor(
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(SECRETS_CONFIG) private secretsConfig: IConfig,
    @inject(AUTHENTICATION_CONFIG) private config: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger,
    @inject(RPC_SERVER_FACTORY) private rpcServerFactory: RpcServerFactory,
    @inject(DATABASE_FACTORY) private databaseFactory: DatabaseFactory,
    @inject(EmailSignUp.USECASE_NAME)
    private emailSignupUseCase: IUseCase<AuthenticationCommands.Service, EmailSignUp.ServiceMethod>
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
    // await this.database.transaction(() => this.emailSignupUseCase.execute(payload));
    //await this.emailSignupUseCase.execute(payload);

    try {
      await this.emailSignupUseCase.execute(payload);
    } catch (error) {
      this.logger.failure(error);
    }
  }

  async handleShutdown(): Promise<void> {
    await this.rpcServer.disconnect();
    await this.database.closeConnection();
  }

  async healthcheck(): Promise<boolean> {
    return this.rpcServer.started;
  }
}
