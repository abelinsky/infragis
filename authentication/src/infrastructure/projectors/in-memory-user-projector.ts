import { inject, injectable } from 'inversify';
import {
  AuthenticationEvents,
  AuthenticationQueryModel,
  DomesticProjector,
  InMemoryEventStore,
  ProjectionHandler,
  StoredEvent,
  InMemoryStore,
  ITransactionable,
  ITransaction,
  TransactionId,
} from '@infragis/common';
import { IN_MEMORY_USERS_STORE } from '../constants';

/**
 * Helper implementation for test purposes.
 */
@injectable()
export class InMemoryUserProjector extends DomesticProjector {
  groupId = 'in_memory_user_projector';

  @inject(InMemoryEventStore) private eventStore: InMemoryEventStore;
  @inject(IN_MEMORY_USERS_STORE) usersStore: InMemoryStore;

  private offset = 0;
  protected projection: Record<any, any> = {};

  protected get transactionProvider(): ITransactionable {
    /* eslint-disable @typescript-eslint/no-empty-function */
    const stubTransaction: ITransaction = {
      id: TransactionId.generate(),
      trx: { commit: () => {}, rollback: () => {}, isCompleted: () => false },
    };
    const beginTransaction = async () => stubTransaction;
    const rollbackTransaction = async (transaction: ITransaction): Promise<void> => {};
    const commitTransaction = async (transaction: ITransaction): Promise<void> => {};
    const transaction = async (
      runner: (transaction: ITransaction) => Promise<any>
    ): Promise<any> => {};
    /* eslint-enable @typescript-eslint/no-empty-function */

    const stub: ITransactionable = {
      beginTransaction,
      rollbackTransaction,
      commitTransaction,
      transaction,
    };
    return stub;
  }

  async getOffset(_topic: string): Promise<number> {
    return this.offset;
  }

  async setOffset(lastProjectedEvent: StoredEvent<Record<any, any>>): Promise<void> {
    this.offset++;
  }

  getEvents(from: number): Promise<StoredEvent[]> {
    return this.eventStore.getAllEvents(from);
  }

  @ProjectionHandler(AuthenticationEvents.EventNames.UserCreated)
  async created(event: StoredEvent<AuthenticationEvents.UserCreatedData>) {
    const userDocument: AuthenticationQueryModel.UserView = {
      userId: event.aggregateId,
      createdAt: event.data.createdAt,
      email: event.data.email,
      sessionId: undefined,
    };

    this.usersStore.set(event.data.email, userDocument);
  }
}
