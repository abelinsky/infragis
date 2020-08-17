import { ApiService } from '../api.service';

export const AuthenticationCommandsService: ApiService = {
  proto: 'authentication-commands',
  packageName: 'authentication',
  serviceName: 'AuthenticationCommands',
};

export * as AuthenticationCommands from './authentication-commands.contract';
