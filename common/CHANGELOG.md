# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ...

### Changed

- ...

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
