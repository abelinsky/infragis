import { StoredEvent } from '../../event-sourcing';

export interface GetEvents {
  after: number;
  streamId?: string;
}

export type GetEventsCommand = (
  payload: GetEvents
) => Promise<{ events: StoredEvent[] }>;
