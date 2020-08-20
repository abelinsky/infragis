// Events Names
export enum EventNames {
  SignUpRequested = 'authentication.session:signUpRequested',
  UserCreated = 'authentication.user:created',
}

// Events Data
export interface UserCreatedData {
  id: string;
  email: string;
  createdAt: string;
}

export interface SignUpRequestedData {
  sessionId: string;
  email: string;
  password: string;
  requestedAt: string;
}
