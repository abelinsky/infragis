import {ApiService} from '../api.service';

export const AuthenticationCommandsService: ApiService = {
  proto: 'authentication-commands.proto',
  packageName: 'authentication',
  serviceName: 'AuthenticationCommands',
};

export * as AuthenticationCommands from './authentication-commands.contract';
