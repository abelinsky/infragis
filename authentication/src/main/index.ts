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
  BaseLogger,
  InMemoryEventStore,
  InMemorySnaphotStore,
  GLOBAL_CONFIG,
  LOGGER_TYPE,
  NOTIFICATION_PRODUCER,
  KAFKA_NOTIFICATION_PRODUCER_FACTORY,
  KafkaNotificationProducer,
  kafkaNotificationProducerFactory,
  KafkaNotificationConsumer,
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

// repositories
import {
  InMemorySessionRepository,
  InMemoryUserRepository,
  IN_MEMORY_USERS_STORE,
} from '@/infrastructure';

import { InMemoryUserProjector, DOMESTIC_USER_PROJECTOR } from '@/infrastructure';
import { SESSION_REPOSITORY, USER_REPOSITORY } from '@/domain';

DI.registerProviders(AuthenticationServer, RpcServer, InMemoryEventStore, InMemorySnaphotStore);

// Event Sourcing
// TODO: Explore if possible to inject Singletons ClassName rather than a label.
DI.registerSingleton(DOMAIN_EVENTS_PUBLISHER, DomainEventsPublisher);
DI.registerSingleton(InMemoryUserProjector, InMemoryUserProjector);
DI.registerSingleton(IN_MEMORY_USERS_STORE, InMemoryStore);

// Register listeners
DI.registerIdentifiedProvider(DOMAIN_EVENTS_LISTENER, DomainEventsListener);

// UseCases
DI.registerIdentifiedProvider(EmailSignUp.USECASE_NAME, EmailSignUp.RequestEmailSignUp);

// Projectors
DI.registerIdentifiedProvider(DOMESTIC_USER_PROJECTOR, InMemoryUserProjector);

// Notifications
DI.registerSingleton(NOTIFICATION_PRODUCER, KafkaNotificationProducer);
DI.registerFactory(KAFKA_NOTIFICATION_PRODUCER_FACTORY, kafkaNotificationProducerFactory);

// Repositories
DI.registerSingleton(SESSION_REPOSITORY, InMemorySessionRepository);
DI.registerSingleton(USER_REPOSITORY, InMemoryUserRepository);

// Factories
DI.registerFactory(RPC_SERVER_FACTORY, rpcServerFactory);

// Configs, utils
DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(AUTHENTICATION_CONFIG, AuthenticationConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);

// Start execution
DI.bootstrap(AuthenticationServer);
