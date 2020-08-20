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

@injectable()
export class GatewayServer {
  private expressServer: InversifyExpressServer = this.expressServerFactory();

  constructor(
    @inject(EXPRESS_SERVER_FACTORY)
    private expressServerFactory: ExpressServerFactory,
    @inject(GLOBAL_CONFIG) private globalConfig: IConfig,
    @inject(GATEWAY_CONFIG) private gatewayConfig: IConfig,
    @inject(LOGGER_TYPE) private logger: ILogger
  ) {
    this.expressServer.setConfig((app: express.Application) => {
      app.use(helmet());
      app.use(bodyParser.json());
    });

    this.expressServer.setErrorConfig((app) => {
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

    this.expressServer
      .build()
      .listen(this.gatewayConfig.getNumber('gateway.port'), () => {
        this.logger.info(
          `  App is running on ${this.gatewayConfig.getNumber(
            'gateway.port'
          )} port in ${this.globalConfig.get('global.environment')} mode`
        );
        this.logger.info('  Press CTRL-C to stop\n');
      });
  }
}
