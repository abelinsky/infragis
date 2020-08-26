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
  KafkaNotificationConsumer,
  NOTIFICATION_CONSUMER,
} from '@infragis/common/';
//import { InboundNotificationHandler } from '../application';

// rpc
import { RpcServer, rpcServerFactory, RPC_SERVER_FACTORY } from '@infragis/common/';

// Event Sourcing
import {
  DOMAIN_EVENTS_PUBLISHER,
  DomainEventsPublisher,
  DOMAIN_EVENTS_LISTENER,
  DomainEventsListener,
} from '@infragis/common';

import { USER_CONFIG, UserConfig } from '@/main/config';
import { UserServer } from '@/main/server';
import { InboundNotificationHandler } from '../application';

DI.registerProviders(
  UserServer,
  RpcServer,
  InMemoryEventStore,
  InMemorySnaphotStore,
  InboundNotificationHandler
);

// Singletons
DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(USER_CONFIG, UserConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);
DI.registerSingleton(DOMAIN_EVENTS_PUBLISHER, DomainEventsPublisher);

// Event-sourcing
DI.registerIdentifiedProvider(DOMAIN_EVENTS_LISTENER, DomainEventsListener);
DI.registerIdentifiedProvider(NOTIFICATION_CONSUMER, KafkaNotificationConsumer);

// UseCases

// Projectors

// Repositories

// Rpc
DI.registerFactory(RPC_SERVER_FACTORY, rpcServerFactory);

// Start execution
DI.bootstrap(UserServer);
