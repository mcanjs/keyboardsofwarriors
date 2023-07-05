import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, SOCKET_PORT, SERVER_PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN, DATABASE_URL } = process.env;
