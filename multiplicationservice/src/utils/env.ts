import dotenv from 'dotenv';
dotenv.config();

export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = +process.env.DB_PORT!;
export const DB_DATABASE = process.env.DB_DATABASE;

export const SERVER_PORT = process.env.SERVER_PORT!;
export const KAFKA_SERVER_URL = process.env.KAFKA_SERVER_URL!;

export const ENCRYPTO_KEY = process.env.ENCRYPTO_KEY!;
