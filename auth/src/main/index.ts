import 'reflect-metadata';

import moduleAlias from 'module-alias';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import { DI } from '@/core/dependency-injection';
import { AuthServer } from '@/main/server';
import { Logger, LOGGER_TYPE } from '@/core/utils';

DI.registerProviders(AuthServer);
DI.registerSingleton(LOGGER_TYPE, Logger);

DI.bootstrap(AuthServer);
