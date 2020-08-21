import { Session } from '../models';

export interface SessionRepository {
  /**
   * Stores session's snapshot and events.
   * @param session @param Session instance.
   */
  store(session: Session): Promise<void>;
}

export const SESSION_REPOSITORY = Symbol.for('__SessionRepository__');
