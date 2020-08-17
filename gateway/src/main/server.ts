import { injectable, inject } from 'inversify';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import {
  EXPRESS_SERVER_FACTORY,
  ExpressServerFactory,
} from '@/main/factories';
import {
  IConfig,
  LOGGER_TYPE,
  GLOBAL_CONFIG,
  ILogger,
} from '@infragis/common';
import { GATEWAY_CONFIG } from '@/main/config';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Server } from 'http';

@injectable()
export class GatewayServer {
  private _server: InversifyExpressServer = this._expressServerFactory();

  constructor(
    @inject(EXPRESS_SERVER_FACTORY)
    private _expressServerFactory: ExpressServerFactory,
    @inject(GLOBAL_CONFIG) private _globalConfig: IConfig,
    @inject(GATEWAY_CONFIG) private _gatewayConfig: IConfig,
    @inject(LOGGER_TYPE) private _logger: ILogger
  ) {
    this._server.setConfig((app: express.Application) => {
      app.use(helmet());
      app.use(bodyParser.json());
    });

    this._server.setErrorConfig((app) => {
      app.use(
        (
          err: any,
          _req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          if (!err) return res.status(500);
          if (!err.code) return res.status(500);
          // TODO: implement it
        }
      );
    });

    this._server
      .build()
      .listen(this._gatewayConfig.getNumber('gateway.port'), () => {
        this._logger.info(
          `  App is running on ${this._gatewayConfig.getNumber(
            'gateway.port'
          )} port in ${this._globalConfig.get('global.environment')} mode`
        );
        this._logger.info('  Press CTRL-C to stop\n');
      });
  }
}
