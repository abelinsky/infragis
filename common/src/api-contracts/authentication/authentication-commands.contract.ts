export interface RequestEmailSignUp {
  email: string;
  password: string;
}

export interface Service {
  requestEmailSignUp: (payload: RequestEmailSignUp) => Promise<void>;
}
