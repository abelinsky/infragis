import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env['global.environment'] === 'dev' || !process.env['global.environment']) {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import {
  DI,
  GlobalConfig,
  SecretsConfig,
  BaseLogger,
  InMemoryEventStore,
  InMemorySnaphotStore,
  GLOBAL_CONFIG,
  SECRETS_CONFIG,
  LOGGER_TYPE,
  NOTIFICATION_PRODUCER,
  KafkaNotificationProducer,
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

// Persistence
import {
  EVENT_STORE,
  EVENT_STORE_FACTORY,
  PostgresEventStore,
  postgresEventStoreFactory,
} from '@infragis/common';

import { AuthenticationConfig, AUTHENTICATION_CONFIG } from '@/main/config';
import { AuthenticationServer } from '@/main/server';

// use-cases
import { EmailSignUp } from '@/application';

// repositories
import {
  InMemorySessionRepository,
  //  InMemoryUserRepository,
  IN_MEMORY_USERS_STORE,
  PostgresUserRepository,
} from '@/infrastructure';

import { InMemoryUserProjector, DOMESTIC_USER_PROJECTOR } from '@/infrastructure';
import { SESSION_REPOSITORY, USER_REPOSITORY } from '@/domain';

DI.registerProviders(AuthenticationServer, RpcServer, InMemoryEventStore, InMemorySnaphotStore);

// TODO: Explore if possible to inject Singletons ClassName rather than a label.

/**
 * Singletons.
 */
DI.registerSingleton(DOMAIN_EVENTS_PUBLISHER, DomainEventsPublisher);
DI.registerSingleton(IN_MEMORY_USERS_STORE, InMemoryStore);
DI.registerSingleton(NOTIFICATION_PRODUCER, KafkaNotificationProducer);
DI.registerSingleton(InMemoryUserProjector, InMemoryUserProjector);

// Config, utils
DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(SECRETS_CONFIG, SecretsConfig);
DI.registerSingleton(AUTHENTICATION_CONFIG, AuthenticationConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);

// Repositories
DI.registerSingleton(SESSION_REPOSITORY, InMemorySessionRepository);
DI.registerSingleton(USER_REPOSITORY, PostgresUserRepository);

// Persistence
DI.registerIdentifiedProvider(EVENT_STORE, PostgresEventStore);
DI.registerFactory(EVENT_STORE_FACTORY, postgresEventStoreFactory);

/**
 * Other providers.
 */

// Listeners
DI.registerIdentifiedProvider(DOMAIN_EVENTS_LISTENER, DomainEventsListener);

// UseCases
DI.registerIdentifiedProvider(EmailSignUp.USECASE_NAME, EmailSignUp.RequestEmailSignUp);

// Projectors
DI.registerIdentifiedProvider(DOMESTIC_USER_PROJECTOR, InMemoryUserProjector);

// Rpc
DI.registerFactory(RPC_SERVER_FACTORY, rpcServerFactory);

// Start execution
DI.bootstrap(AuthenticationServer);
