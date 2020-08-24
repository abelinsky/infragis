import {
  Session,
  SessionRepository,
  User,
  UserRepository,
  SESSION_REPOSITORY,
  USER_REPOSITORY,
} from '@/domain';
import {
  AuthenticationCommands,
  Email,
  IUseCase,
  SessionId,
  UserId,
  Timestamp,
  Password,
  LOGGER_TYPE,
  ILogger,
} from '@infragis/common';
import { inject, injectable } from 'inversify';

export const USECASE_NAME: AuthenticationCommands.ServiceType = 'requestEmailSignUp';
export type ServiceMethod = Extract<AuthenticationCommands.ServiceType, typeof USECASE_NAME>;

@injectable()
export class RequestEmailSignUp implements IUseCase<AuthenticationCommands.Service, ServiceMethod> {
  @inject(LOGGER_TYPE) logger: ILogger;

  constructor(
    @inject(USER_REPOSITORY) private userRepository: UserRepository,
    @inject(SESSION_REPOSITORY) private sessionRepository: SessionRepository
  ) {}

  execute = async (payload: AuthenticationCommands.RequestEmailSignUp): Promise<void> => {
    this.logger.info(`Use-case RequestEmailSignUp started with payload ${JSON.stringify(payload)}`);

    const requestedAt = Timestamp.now();
    const { email, password } = payload;

    let userId = await this.userRepository.getId(email);

    if (!userId) {
      userId = UserId.generate();
      const hashedPassword = await Password.fromString(password).hash();
      const user = User.create(userId, Email.fromString(email), hashedPassword, Timestamp.now());
      await this.userRepository.store(user);
    }

    const sessionId = SessionId.generate();
    const session = Session.emailSignUp(sessionId, userId, Email.fromString(email), requestedAt);
    await this.sessionRepository.store(session);

    this.logger.info('Use-case RequestEmailSignUp completed.');

    // TODO: Create tokens
  };
}
