import { inject } from 'inversify';
import express from 'express';
import {
  controller,
  interfaces,
  httpPost,
  httpGet,
} from 'inversify-express-utils';
import {
  IConfig,
  LOGGER_TYPE,
  GLOBAL_CONFIG,
  ILogger,
} from '@infragis/common';
import { GATEWAY_CONFIG } from '@/main/config';

import { ApiEndpoints } from '@infragis/common';

@controller(`/api/${ApiEndpoints.Authentication}`)
export class AuthenticationController implements interfaces.Controller {
  constructor(
    @inject(GLOBAL_CONFIG) private _globalConfig: IConfig,
    @inject(GATEWAY_CONFIG) private _gatewayConfig: IConfig,
    @inject(LOGGER_TYPE) private _logger: ILogger
  ) {}

  @httpPost('/signup/email')
  requestSignup(req: express.Request) {
    const { email, password } = req.body;
    this._logger.info(
      `Request sign up for ${email} with password ${password}`
    );
  }
}
