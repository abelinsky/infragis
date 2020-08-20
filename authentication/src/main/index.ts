import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

const __DEBUG = true;

if (process.env['global.environment'] === 'dev' || __DEBUG) {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import { DI, GlobalConfig, GLOBAL_CONFIG, BaseLogger, LOGGER_TYPE } from '@infragis/common/';

// rpc
import { RpcServer, rpcServerFactory, RPC_SERVER_FACTORY } from '@infragis/common/';

// use-cases
import { EmailSignUp } from '../usecases';

import { AuthenticationConfig, AUTHENTICATION_CONFIG } from '@/main/config';
import { AuthenticationServer } from '@/main/server';

DI.registerProviders(AuthenticationServer, RpcServer);

// UseCases
DI.registerIdentifiedProvider(EmailSignUp.USECASE_NAME, EmailSignUp.RequestEmailSignUp);

DI.registerFactory(RPC_SERVER_FACTORY, rpcServerFactory);

DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(AUTHENTICATION_CONFIG, AuthenticationConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);

DI.bootstrap(AuthenticationServer);
