import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env['global.environment'] === 'dev' || !process.env['global.environment']) {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

// Event Sourcing
import { DI, InMemoryStore } from '@infragis/common';
import { AuthenticationConfig, AUTHENTICATION_CONFIG } from '@/main/config';
import { AuthenticationServer } from '@/main/server';

// use-cases
import { EmailSignUp } from '@/application';

// repositories
import {
  PostgresSessionRepository,
  PostgresUserRepository,
  InMemoryUserProjector,
  DOMESTIC_USER_PROJECTOR,
  IN_MEMORY_USERS_STORE,
} from '@/infrastructure';

import { SESSION_REPOSITORY, USER_REPOSITORY } from '@/domain';

DI.applyDefaultBindings();

DI.registerProviders(AuthenticationServer);

DI.registerSingleton(AUTHENTICATION_CONFIG, AuthenticationConfig);
DI.registerSingleton(IN_MEMORY_USERS_STORE, InMemoryStore);

DI.registerSingleton(SESSION_REPOSITORY, PostgresSessionRepository);
DI.registerSingleton(USER_REPOSITORY, PostgresUserRepository);

DI.registerIdentifiedProvider(EmailSignUp.USECASE_NAME, EmailSignUp.RequestEmailSignUp);
DI.registerIdentifiedProvider(DOMESTIC_USER_PROJECTOR, InMemoryUserProjector);
DI.registerSingleton(InMemoryUserProjector, InMemoryUserProjector);

DI.bootstrap(AuthenticationServer);
