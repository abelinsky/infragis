import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env['global.environment'] === 'dev') {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import {
  DI,
  GlobalConfig,
  GLOBAL_CONFIG,
  ILogger,
  BaseLogger,
  LOGGER_TYPE,
} from '@infragis/common/';
import { GatewayServer } from '@/main/server';
import { AuthenticationController } from '@/presentation';
import { GatewayConfig, GATEWAY_CONFIG } from './config';
import {
  EXPRESS_SERVER_FACTORY,
  expressServerFactory,
} from '@/main/factories';

DI.registerProviders(GatewayServer, AuthenticationController);

DI.registerFactory(EXPRESS_SERVER_FACTORY, expressServerFactory);

DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(GATEWAY_CONFIG, GatewayConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);

DI.bootstrap(GatewayServer);
