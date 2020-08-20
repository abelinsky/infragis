import {
  IUseCase,
  AuthenticationCommands,
  UserId,
  ILogger,
  LOGGER_TYPE,
  SessionId,
  Email,
} from '@infragis/common';
import { injectable, inject } from 'inversify';
import {
  Session,
  User,
  UserRepository,
  USER_REPOSITORY,
  SnapshotRepository,
  SESSION_REPOSITORY,
} from '@/domain';

import { Timestamp } from '@infragis/common';

export const USECASE_NAME: AuthenticationCommands.ServiceType = 'requestEmailSignUp';
export type UsecaseType = Extract<AuthenticationCommands.ServiceType, typeof USECASE_NAME>;

@injectable()
export class RequestEmailSignUp implements IUseCase<AuthenticationCommands.Service, UsecaseType> {
  constructor(
    @inject(LOGGER_TYPE) private logger: ILogger,
    @inject(USER_REPOSITORY) private userRepository: UserRepository,
    @inject(SESSION_REPOSITORY) private sessionRepository: SnapshotRepository<Session>
  ) {}

  execute = async (payload: AuthenticationCommands.RequestEmailSignUp): Promise<void> => {
    const { email, password } = payload;

    const existingUser = await this.userRepository.getByEmail(email);

    // TODO: Send userId to Session factory
    const userId = existingUser
      ? UserId.fromString(existingUser.aggregateId.toString())
      : UserId.generate();

    const sessionId = SessionId.generate();
    const session = Session.emailSignUp(
      sessionId,
      Email.fromString(email),
      password,
      Timestamp.now()
    );

    await this.store(session);

    // TODO: Create tokens
  };

  private async store(session: Session): Promise<void> {
    // TODO: Store events
    // this.sessionRepository.get(session.aggregateId);
    // TODO: Store snapshots
  }
}
