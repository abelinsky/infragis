import { injectable, inject } from 'inversify';
import {
  RpcServer,
  RpcHandler,
  RPC_SERVER_FACTORY,
  rpcServerFactory,
  RpcServerFactory,
} from '@infragis/common';
import {
  IConfig,
  LOGGER_TYPE,
  GLOBAL_CONFIG,
  ILogger,
} from '@infragis/common';
import { AUTHENTICATION_CONFIG } from '@/main/config';
import {
  AuthenticationCommands,
  AuthenticationCommandsService,
} from '@infragis/common';

@injectable()
export class AuthenticationServer
implements AuthenticationCommands.Service {
  private _rpcServer: RpcServer = this._rpcServerFactory({
    services: [AuthenticationCommandsService],
    methodsHandlerInstance: this,
  });

  constructor(
    @inject(GLOBAL_CONFIG) private _globalConfig: IConfig,
    @inject(AUTHENTICATION_CONFIG) private _gatewayConfig: IConfig,
    @inject(LOGGER_TYPE) private _logger: ILogger,
    @inject(RPC_SERVER_FACTORY) private _rpcServerFactory: RpcServerFactory
  ) {}

  @RpcHandler(AuthenticationCommandsService)
  async requestEmailSignUp(
    payload: AuthenticationCommands.RequestEmailSignUp
  ): Promise<void> {
    this._logger.info(
      `AuthenticationServer:requestEmailSignUp rpc call with payload: email: ${payload.email}, password: ${payload.password}`
    );
  }
}
