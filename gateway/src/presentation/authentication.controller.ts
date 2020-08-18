import { GATEWAY_CONFIG } from '@/main/config';
import {
  GLOBAL_CONFIG,
  IConfig,
  ILogger,
  LOGGER_TYPE,
  RpcClientFactory,
  AuthenticationCommandsService,
} from '@infragis/common';
import {
  ApiEndpoints,
  ApiService,
  AuthenticationCommands,
  RPC_CLIENT_FACTORY,
  RpcClient,
} from '@infragis/common';
import express from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  interfaces,
} from 'inversify-express-utils';

@controller(`/api/${ApiEndpoints.Authentication}`)
export class AuthenticationController implements interfaces.Controller {
  private _authenticationRpc: RpcClient<
    AuthenticationCommands.Service
  > = this._rpcClientFactory({
    host: this._gatewayConfig.get('authentication.rpc.host'),
    service: AuthenticationCommandsService,
    port: this._gatewayConfig.getNumber('authentication.rpc.port'),
  });

  constructor(
    @inject(RPC_CLIENT_FACTORY)
    private _rpcClientFactory: RpcClientFactory,
    @inject(GLOBAL_CONFIG) private _globalConfig: IConfig,
    @inject(GATEWAY_CONFIG) private _gatewayConfig: IConfig,
    @inject(LOGGER_TYPE) private _logger: ILogger
  ) {}

  @httpPost('/signup/email')
  requestSignUp(req: express.Request) {
    const { email, password } = req.body;
    this._logger.info(
      `Gateway: request sign up for ${email} with password ${password}`
    );
    this._authenticationRpc.client.requestEmailSignUp({ email, password });
  }
}
