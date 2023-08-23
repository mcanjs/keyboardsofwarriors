import { cleanEnv, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    DATABASE_URL: str(),
    SERVER_PORT: port(),
    SOCKET_PORT: str(),
    EMAIL_USER: str(),
    EMAIL_PASS: str(),
    EMAIL_HOST: str(),
    EMAIL_PORT: port(),
  });
};
