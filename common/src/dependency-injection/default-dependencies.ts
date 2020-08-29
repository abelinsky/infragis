import { interfaces, ContainerModule } from 'inversify';
import { GlobalConfig, SecretsConfig } from '../config';
import { BaseLogger } from '../utils';
import { RpcServer, rpcServerFactory } from '../rpc';
import {
  DomainEventsPublisher,
  DomainEventsListener,
  InMemoryEventStore,
  InMemorySnaphotStore,
  KafkaNotificationProducer,
} from '../event-sourcing';
import { PostgresEventStore, postgresEventStoreFactory } from '../persistence';
import {
  GLOBAL_CONFIG,
  SECRETS_CONFIG,
  LOGGER_TYPE,
  DOMAIN_EVENTS_PUBLISHER,
  DOMAIN_EVENTS_LISTENER,
  NOTIFICATION_PRODUCER,
  EVENT_STORE,
  EVENT_STORE_FACTORY,
  RPC_SERVER_FACTORY,
} from './constants';

/**
 * Contains default dependencies that can be used in all services across platfor as recommended.
 * If it's necessary to use another dependency, use `unbind` metods of DI container.
 */
const defaultDependencies = new ContainerModule(
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

    // Sets BaseLogger as Singleton with `LOGGER_TYPE` identifier
    bind(LOGGER_TYPE).to(BaseLogger).inSingletonScope();

    // Provides RpcServer that is de facto singleton for each service since
    // usually only one instance of it is created in the service lifecycle
    bind(RpcServer).toSelf();

    // Provides factory for RpcServer.
    bind(RPC_SERVER_FACTORY).toFactory(rpcServerFactory);

    // Provides InMemoryEventStore in transient scope to allow multiple event stores per service.
    // Note that in-memory store is mainly useful for testing purposes.
    bind(InMemoryEventStore).toSelf();

    // Provides InMemorySnaphotStore in transient scope to allow multiple snapshot stores per service.
    // Note that in-memory store is mainly useful for testing purposes.
    bind(InMemorySnaphotStore).toSelf();

    // Sets DomainEventsPublisher as Singleton with `DOMAIN_EVENTS_PUBLISHER` identifier.
    bind(DOMAIN_EVENTS_PUBLISHER).to(DomainEventsPublisher).inSingletonScope();

    // Provides `DomainEventsListener` instances for `DOMAIN_EVENTS_LISTENER` in transient scope
    // to allow multiple listeners.
    bind(DOMAIN_EVENTS_LISTENER).to(DomainEventsListener);

    // Sets KafkaNotificationProducer as Singleton with `NOTIFICATION_PRODUCER` identifier.
    bind(NOTIFICATION_PRODUCER).to(KafkaNotificationProducer).inSingletonScope();

    // Provides PostgresEventStore for `EVENT_STORE` identifier in transient scope to allow
    // multiple event stores per service (for different kinds of Aggregates).
    bind(EVENT_STORE).to(PostgresEventStore);

    // Provides service factory for PostgresEventStore.
    bind(EVENT_STORE_FACTORY).toFactory(postgresEventStoreFactory);
  }
);

export default defaultDependencies;
