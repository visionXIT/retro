import dotenv from 'dotenv';
dotenv.config();

export const SERVER_PORT = process.env.SERVER_PORT;
export const KAFKA_SERVER_URL = process.env.KAFKA_SERVER_URL!;

export const HOST_SENDER = process.env.HOST_SENDER!;
export const PORT_SENDER = process.env.PORT_SENDER!;
export const EMAIL_SENDER = process.env.EMAIL_SENDER!;
export const PASSWORD_SENDER = process.env.PASSWORD_SENDER!;
