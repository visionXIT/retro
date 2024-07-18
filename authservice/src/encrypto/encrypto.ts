import crypto from 'crypto-js';
import { ENCRYPTION_KEY } from 'utils/env';

// Encryption function
export function encryptData(data: string): string {
  const encryptedData = crypto.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();

  return encryptedData;
}

export const decryptData = (encryptedData: string): string => {
  const bytes = crypto.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedData = bytes.toString(crypto.enc.Utf8);

  return decryptedData;
};
