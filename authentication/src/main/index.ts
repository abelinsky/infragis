import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

const __DEBUG = true;

if (process.env['global.environment'] === 'dev' || __DEBUG) {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import {
  DI,
  GlobalConfig,
  BaseLogger,
  InMemoryEventStore,
  InMemorySnaphotStore,
  GLOBAL_CONFIG,
  LOGGER_TYPE,
} from '@infragis/common/';

// rpc
import { RpcServer, rpcServerFactory, RPC_SERVER_FACTORY } from '@infragis/common/';

// Event Sourcing
import {
  DOMAIN_EVENTS_PUBLISHER,
  DomainEventsPublisher,
  DOMAIN_EVENTS_LISTENER,
  DomainEventsListener,
} from '@infragis/common';

import { AuthenticationConfig, AUTHENTICATION_CONFIG } from '@/main/config';
import { AuthenticationServer } from '@/main/server';

// use-cases
import { EmailSignUp } from '../usecases';

// repositories
import { InMemorySessionRepository, InMemoryUserRepository } from '@/infrastructure';
import { InMemoryUserProjector } from '@/infrastructure/projectors';
import { SESSION_REPOSITORY, USER_REPOSITORY } from '@/domain';

DI.registerProviders(AuthenticationServer, RpcServer, InMemoryEventStore, InMemorySnaphotStore);

// Event Sourcing
// TODO: Explore if possible to inject Singletons ClassName rather than a label.
DI.registerSingleton(DOMAIN_EVENTS_PUBLISHER, DomainEventsPublisher);
DI.registerSingleton(DOMAIN_EVENTS_LISTENER, DomainEventsListener);
DI.registerSingleton(InMemoryUserProjector, InMemoryUserProjector);

// UseCases
DI.registerIdentifiedProvider(EmailSignUp.USECASE_NAME, EmailSignUp.RequestEmailSignUp);

// Repositories
DI.registerIdentifiedProvider(SESSION_REPOSITORY, InMemorySessionRepository);
DI.registerIdentifiedProvider(USER_REPOSITORY, InMemoryUserRepository);

// Factories
DI.registerFactory(RPC_SERVER_FACTORY, rpcServerFactory);

// Configs, utils
DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(AUTHENTICATION_CONFIG, AuthenticationConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);

DI.bootstrap(AuthenticationServer);
