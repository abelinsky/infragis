import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@infragis/common';
import { usersRouter } from '@/infra/api/routes';

// import { signUpRouter } from './infra/api/routes/signup';
// import { signInRouter } from './infra/api/routes/signin';
// import { signOutRouter } from './infra/api/routes/signout';
// import { currentUserRouter } from './infra/api/routes/current-user';

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(
  cookieSession({
    signed: false,
    // cookie will be shared only in https connection
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(usersRouter);

// app.use(signUpRouter);
// app.use(signInRouter);
// app.use(signOutRouter);
// app.use(currentUserRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
