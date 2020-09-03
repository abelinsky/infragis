# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

This version allows:

- To persist events and snapshots to PostgreSQL
- To track and project events into Query Models views
- To persist Query-Models' views in Postgres

### Added

- new `persistence` module with PostgresEventStore, PostgresSnapshotStore
- `dependency-injection` module: default bindings
- classes for projecting events into Query-Models' views and persisting them

### Changed

- Event and snapshot storage is set to Postgres by default
- Projectors can now track (and persist in Postgres) their positions within topics

### Removed

- ...

## [0.1.0] - 2020-08-26

### Description

This version allows:

- To declare Api-contract (in \*.proto files) to deal with microservice through RPC calls (based on gRPC).
- To create an Rpc and http server for a microservice and use them for communication between services.
- To implement the full flow of event-sourcing.
- To deal with exceptions.
- To use common utility (configs, logging, etc.).

### Added

- Interfaces and base implementations for framework

  - api-contracts:
    - Schema definitions (\*.proto) for Commands and Events
    - Models for events
    - Public api-endpoints for services
    - Utility classes for loading Rpc Services, packaging messages in protobuf
  - config: Contract and base implementation for dealing with service `Config`
  - dependency-injection: Utility methods for dealing with DI.
  - event-sourcing:
    - core classes for dealing with `Aggregates`, `Domain Events`, `Event streams`, `Stored Events` and `Snapshots`
    - generic base class of the `Event Store` and simple in-memory implementation
    - Event sourcing `Exceptions` implemention
    - classes for dealing woth `Notifications` to exchange messages about domain events between services
    - classes for dealing with `Projections`
    - classes for dealing with publishing and listening ot he domain events
    - classes for dealing with `Snapshot store` and simple in-memory implementation
  - exceptions: Base `ServiceException` implementation
  - rpc: Base classes for creating `RpcServer`, `RpcClient`, `Rpc handlers`, and `RpcStatus` enum
  - types: Basic types (value objects) - `Email`, `EventName`, `Timestamp`, etc.
  - use-cases: The declaration of the `UseCase`.
  - utils:
    - logger
    - service server responsible for loading `Application Daemons` (silent workers) and starting inner http server.
