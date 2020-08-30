import { ContainerModule, interfaces, decorate, injectable } from 'inversify';
import { GlobalConfig, SecretsConfig } from '../config';
import {
  DomainEventsListener,
  DomainEventsPublisher,
  InMemoryEventStore,
  InMemorySnaphotStore,
  KafkaNotificationProducer,
  KafkaNotificationConsumer,
} from '../event-sourcing';
import {
  PostgresEventStore,
  postgresEventStoreFactory,
  PostgresSnapshotStore,
  postgresSnapshotStoreFactory,
} from '../persistence';
import { RpcServer, rpcServerFactory } from '../rpc';
import { BaseLogger } from '../utils';

import {
  DOMAIN_EVENTS_LISTENER,
  DOMAIN_EVENTS_PUBLISHER,
  EVENT_STORE,
  EVENT_STORE_FACTORY,
  GLOBAL_CONFIG,
  LOGGER_TYPE,
  NOTIFICATION_CONSUMER,
  NOTIFICATION_PRODUCER,
  RPC_SERVER_FACTORY,
  SECRETS_CONFIG,
  SNAPSHOT_STORE,
  SNAPSHOT_STORE_FACTORY,
} from './constants';

/**
 * Contains default bindings that can be used in all services across platfor as
 * recommended. If it's necessary to use another binding, use `unbind => bind`
 * methods of DI container or `overrideProvider` of `DI.ts`.
 */

/**
 * Provides default configs.
 */
export const configs = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Sets GlobalConfig as Singleton with `GLOBAL_CONFIG` identifier
    bind(GLOBAL_CONFIG).to(GlobalConfig).inSingletonScope();

    // Sets SecretsConfig as Singleton with `SECRETS_CONFIG` identifier
    bind(SECRETS_CONFIG).to(SecretsConfig).inSingletonScope();
  }
);

/**
 * Provides default utils.
 */
export const utils = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Sets BaseLogger as Singleton with `LOGGER_TYPE` identifier
    bind(LOGGER_TYPE).to(BaseLogger).inSingletonScope();
  }
);

/**
 * Provides default Rpc bindings.
 */
export const rpc = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Provides RpcServer that is de facto singleton for each service since
    // usually only one instance of it is created in the service lifecycle
    bind(RpcServer).toSelf();

    // Provides factory for RpcServer.
    bind(RPC_SERVER_FACTORY).toFactory(rpcServerFactory);
  }
);

/**
 * Provides default Domain Events Pub/Sub bindings.
 */
export const eventsPublishing = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Sets DomainEventsPublisher as Singleton with `DOMAIN_EVENTS_PUBLISHER`
    // identifier.
    bind(DOMAIN_EVENTS_PUBLISHER).to(DomainEventsPublisher).inSingletonScope();

    // Provides `DomainEventsListener` instances for `DOMAIN_EVENTS_LISTENER`
    // in transient scope to allow multiple listeners.
    bind(DOMAIN_EVENTS_LISTENER).to(DomainEventsListener);
  }
);

/**
 * Provides default notification bindings.
 */
export const notifications = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Sets KafkaNotificationProducer as Singleton with
    // `NOTIFICATION_PRODUCER` identifier.
    bind(NOTIFICATION_PRODUCER).to(KafkaNotificationProducer).inSingletonScope();

    // Provides `KafkaNotificationConsumer` instances for `NOTIFICATION_CONSUMER`
    // in transient scope to allow multiple consumers.
    bind(NOTIFICATION_CONSUMER).to(KafkaNotificationConsumer);
  }
);

/**
 * Provides default memory store bindings.
 */
export const memoryStores = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Provides InMemoryEventStore in transient scope to allow multiple event
    // stores per service. Note that in-memory store is mainly useful for
    // testing purposes.
    bind(InMemoryEventStore).toSelf();

    // Provides InMemorySnaphotStore in transient scope to allow multiple
    // snapshot stores per service. Note that in-memory store is mainly useful
    // for testing purposes.
    bind(InMemorySnaphotStore).toSelf();
  }
);

/**
 * Provides default persistence bindings.
 */
export const persistence = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind
  ) => {
    // Provides PostgresEventStore for `EVENT_STORE` identifier in transient
    // scope to allow multiple event stores per service (for different kinds
    // of Aggregates).
    bind(EVENT_STORE).to(PostgresEventStore);

    // Provides factory for PostgresEventStore.
    bind(EVENT_STORE_FACTORY).toFactory(postgresEventStoreFactory);

    // Provides PostgresSnapshotStore for `SNAPSHOT_STORE` identifier in
    // transient scope to allow multiple snapshot stores per service (for
    // different kinds of Aggregates).
    bind(SNAPSHOT_STORE).to(PostgresSnapshotStore);

    // Provides factory for PostgresSnapshotStore.
    bind(SNAPSHOT_STORE_FACTORY).toFactory(postgresSnapshotStoreFactory);
  }
);

export const modules: interfaces.ContainerModule[] = [
  configs,
  utils,
  rpc,
  eventsPublishing,
  notifications,
  memoryStores,
  persistence,
];
