const env = {
  JWT_KEY: process.env.JWT_KEY,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_HOST: process.env.POSTGRES_HOST, // auth-postgres-srv.default
};

export const assertEnvSet = (): void => {
  for (const [key, value] of Object.entries(env)) {
    if (!value) {
      throw new Error(`${key} must be defined.`);
    }
  }
};

export default env;
