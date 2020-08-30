// Configs, utils
export const GLOBAL_CONFIG = Symbol.for('GlobalConfig');
export const SECRETS_CONFIG = Symbol.for('BaseConfig');
export const LOGGER_TYPE = Symbol.for('ILogger');

// Event-sourcing
export const DOMAIN_EVENTS_PUBLISHER = Symbol.for('__IDomainEventsPublisher__');
export const DOMAIN_EVENTS_LISTENER = Symbol.for('__DomainEventsListener__');
export const NOTIFICATION_PRODUCER = Symbol.for('__INotificationProducer__');
export const NOTIFICATION_CONSUMER = Symbol.for('__INotificationConsumer__');
export const EVENT_STORE = Symbol.for('__EventStore__');
export const EVENT_STORE_FACTORY = Symbol.for('__<Placeholder>EventStoreFactory__');
export const SNAPSHOT_STORE = Symbol.for('__SnapshotStore__');
export const SNAPSHOT_STORE_FACTORY = Symbol.for('__<Placeholder>SnapshotStoreFactory__');

// Rpc
export const RPC_SERVER_FACTORY = Symbol.for('RPC_SERVER_FACTORY');
export const RPC_CLIENT_FACTORY = Symbol.for('RPC_CLIENT_FACTORY');
