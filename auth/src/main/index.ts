import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env['global.environment'] === 'dev') {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import { DI } from '@infragis/common';
import { AuthConfig, AUTH_CONFIG_TYPE } from './auth.config';
import { AuthServer } from '@/main/server';
import { Logger, LOGGER_TYPE } from '@/core/utils';
import { GlobalConfig, GLOBAL_CONFIG_TYPE } from '@/core/config';

DI.registerProviders(AuthServer);

DI.registerSingleton(LOGGER_TYPE, Logger);
DI.registerSingleton(GLOBAL_CONFIG_TYPE, GlobalConfig);
DI.registerSingleton(AUTH_CONFIG_TYPE, AuthConfig);

DI.bootstrap(AuthServer);
