import dotenv from 'dotenv';
dotenv.config();

export const SERVER_PORT = +process.env.SERVER_PORT!;

export const OKX_API_URL_WITHDRAW = process.env.OKX_API_URL_WITHDRAW as string;
export const OKX_API_URL_CURRENCIES = process.env.OKX_API_URL_CURRENCIES as string;
export const OKX_URL = process.env.OKX_URL as string;
export const OKX_TIMEOUT = process.env.OKX_TIMEOUT as string;

export const OKX_API_KEY = process.env.OKX_API_KEY as string;
export const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY as string;
export const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE as string;

export const KAFKA_SERVER_URL = process.env.KAFKA_SERVER_URL!;

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
