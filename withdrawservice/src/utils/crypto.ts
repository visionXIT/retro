import crypto from 'crypto-js';
import { ENCRYPTION_KEY } from './env';

export const encryptData = (data: string): string => {
  const encryptedData = crypto.AES.encrypt(data, ENCRYPTION_KEY).toString();
  return encryptedData;
}

export const decryptData = (encryptedData: string): string => {
  const decryptedData = crypto.AES.decrypt(encryptedData, ENCRYPTION_KEY).toString(crypto.enc.Utf8);
  return decryptedData;
};
