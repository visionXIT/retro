import dotenv from 'dotenv';
dotenv.config();

export const SERVER_PORT = process.env.SERVER_PORT!;
export const KAFKA_SERVER_URL = process.env.KAFKA_SERVER_URL!;

export const DEBUG = process.env.DEBUG ? 
                          (process.env.DEBUG === 'false' ? false : true) : 
                          false
export const DEBUG_USER = process.env.DEBUG_USER ? 
                            +process.env.DEBUG_USER : 0