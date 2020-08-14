import { Express } from 'express';
import bodyParser from 'body-parser';
// import compression from 'compression';
import cookieSession from 'cookie-session';
import { errorHandler } from '@infragis/common';
import { contentType } from './content-type';

const setupMiddlewares = (app: Express): void => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(compression());
  app.use(
    cookieSession({
      signed: false,
      // cookie will be shared only in https connection
      secure: process.env.NODE_ENV !== 'test',
    })
  );
  app.use(contentType);
  app.use(errorHandler);
};

export default setupMiddlewares;
