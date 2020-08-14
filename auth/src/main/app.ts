import express from 'express';
import 'express-async-errors';

import setupRoutes from './routes';
import setupMiddlewares from './middlewares';

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('trust proxy', true);

setupMiddlewares(app);
setupRoutes(app);

export default app;
