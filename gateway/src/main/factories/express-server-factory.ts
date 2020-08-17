import { interfaces, Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

export type ExpressServerFactory = () => InversifyExpressServer;

export const expressServerFactory = (
  context: interfaces.Context
): ExpressServerFactory => {
  return () => {
    return new InversifyExpressServer(context.container);
  };
};
