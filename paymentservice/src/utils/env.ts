import dotenv from 'dotenv';
dotenv.config();

export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = +process.env.DB_PORT!;
export const DB_DATABASE = process.env.DB_DATABASE;

export const SERVER_PORT = +process.env.SERVER_PORT!;

export const KAFKA_SERVER_URL = process.env.KAFKA_SERVER_URL!;

export const NOW_PAYMENT_API_KEY = process.env.NOWPAYMENT_API_KEY!;
export const NOW_PAYMENT_PRIVATE_KEY = process.env.NOWPAYMENT_PRIVATE_KEY!;

export const PAYMENT_EXPIRE_TIME = +process.env.PAYMENT_EXPIRE_TIME!;

export const ACCESS_TOKEN_SECRET = process.env.PAYMENT_EXPIRE_TIME!;
export const ACCESS_TOKEN_EXPIRATION_TIME = process.env.ACCESS_TOKEN_EXPIRATION_TIME || '30m';
export const REFRESH_TOKEN_EXPIRATION_TIME = process.env.REFRESH_TOKEN_EXPIRATION_TIME || '30d';

export const DEBUG = process.env.DEBUG ? (process.env.DEBUG === 'false' ? false : true) : false;
export const DEBUG_USER = process.env.DEBUG_USER ? +process.env.DEBUG_USER : 0;
