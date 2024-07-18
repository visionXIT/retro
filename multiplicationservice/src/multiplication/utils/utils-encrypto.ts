import crypto from 'crypto-js';
import { ENCRYPTO_KEY } from '../../utils/env';

export const decryptData = (encryptedData: string): string => {
  // const newExactString = encryptedData.replaceAll('"', '');
  // const decData = crypto.enc.Base64.parse(newExactString).toString(crypto.enc.Utf8);
  const decryptedData = crypto.AES.decrypt(encryptedData, ENCRYPTO_KEY).toString(crypto.enc.Utf8);

  return decryptedData;
};
