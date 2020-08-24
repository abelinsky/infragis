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
  InMemoryStore,
} from '@infragis/common';

import { AuthenticationConfig, AUTHENTICATION_CONFIG } from '@/main/config';
import { AuthenticationServer } from '@/main/server';

// use-cases
import { EmailSignUp } from '@/application';
// import { UserProjectionDaemon } from '@/application';

// repositories
import {
  InMemorySessionRepository,
  InMemoryUserRepository,
  IN_MEMORY_USERS_STORE,
} from '@/infrastructure';

import { InMemoryUserProjector, DOMESTIC_USER_PROJECTOR } from '@/infrastructure';
import { SESSION_REPOSITORY, USER_REPOSITORY } from '@/domain';

DI.registerProviders(AuthenticationServer, RpcServer, InMemoryEventStore, InMemorySnaphotStore);

// Register Daemons
// DI.registerProviders(UserProjectionDaemon);

// Event Sourcing
// TODO: Explore if possible to inject Singletons ClassName rather than a label.
DI.registerSingleton(DOMAIN_EVENTS_PUBLISHER, DomainEventsPublisher);
DI.registerSingleton(DOMAIN_EVENTS_LISTENER, DomainEventsListener);
DI.registerSingleton(InMemoryUserProjector, InMemoryUserProjector);
DI.registerSingleton(IN_MEMORY_USERS_STORE, InMemoryStore);

// UseCases
DI.registerIdentifiedProvider(EmailSignUp.USECASE_NAME, EmailSignUp.RequestEmailSignUp);

// Projectors
DI.registerIdentifiedProvider(DOMESTIC_USER_PROJECTOR, InMemoryUserProjector);

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
