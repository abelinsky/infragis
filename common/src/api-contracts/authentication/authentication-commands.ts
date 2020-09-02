import { GetEventsCommand } from '../common';

export interface RequestEmailSignUp {
  email: string;
  password: string;
}

export interface Service {
  requestEmailSignUp: (payload: RequestEmailSignUp) => Promise<void>;
  getEvents: GetEventsCommand;
}

export type ServiceType = keyof Service;
