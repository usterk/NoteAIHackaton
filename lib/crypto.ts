import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change-me!!';

export function encryptNote(content: string): { encryptedData: string; iv: string } {
  const iv = CryptoJS.lib.WordArray.random(16).toString();
  const encrypted = CryptoJS.AES.encrypt(content, ENCRYPTION_KEY, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedData: encrypted.toString(),
    iv,
  };
}

export function decryptNote(encryptedData: string, iv: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
