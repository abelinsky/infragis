import { Express, Router } from 'express';
import { readdirSync } from 'fs';
import { NotFoundError } from '@infragis/common';
import path from 'path';

const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use('/api', router);
  readdirSync(`${__dirname}`).map(async (file) => {
    if (
      file !== path.basename(__filename) &&
      !file.includes('.test.') &&
      !file.endsWith('.map')
    ) {
      (await import(`${__dirname}/${file}`)).default(router);
    }
  });

  app.all('*', async () => {
    throw new NotFoundError();
  });
};

export default setupRoutes;
