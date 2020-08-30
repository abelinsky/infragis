import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env['global.environment'] === 'dev' || !process.env['global.environment']) {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import { DI } from '@infragis/common/';
import { USER_CONFIG, UserConfig } from '@/main/config';
import { UserServer } from '@/main/server';
import { InboundNotificationHandler } from '../application';

DI.applyDefaultBindings();

DI.registerProviders(UserServer, InboundNotificationHandler);
DI.registerSingleton(USER_CONFIG, UserConfig);

DI.bootstrap(UserServer);
