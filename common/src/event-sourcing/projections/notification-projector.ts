import { Projector } from './projector';
import { injectable } from 'inversify';

/**
 * A Projector that listens for notification events from event-bus
 * (i.e. from other BoundedContext aka Service) and performs projections.
 * For handling and projecting domain events internally see {@link DomesticProjector}.
 */
@injectable()
export abstract class NotificationProjector extends Projector {
  // TODO: implement
}
