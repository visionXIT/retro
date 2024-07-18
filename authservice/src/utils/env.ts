import dotenv from 'dotenv';
dotenv.config();

export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = +process.env.DB_PORT!;
export const DB_DATABASE = process.env.DB_DATABASE;

export const SERVER_PORT = +process.env.SERVER_PORT!;
export const KAFKA_SERVER_URL = process.env.KAFKA_SERVER_URL!;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '';
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export const ACCESS_TOKEN_EXPIRATION_TIME = process.env.ACCESS_TOKEN_EXPIRATION_TIME || '30m';
export const REFRESH_TOKEN_EXPIRATION_TIME = process.env.REFRESH_TOKEN_EXPIRATION_TIME || '30d';

export const CODE_EXPIRATION_TIME = +process.env.CODE_EXPIRATION_TIME! || 1000 * 60 * 10;