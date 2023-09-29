const CryptoJS = require("crypto-js");
import { generateSalt } from "./genSalt";

export const generateEncryptionKey = (username: string, password: string) => {
  // Usage: Generate a random string of 30 characters
  const randomString = generateSalt(30);
  const key = username + randomString + password;
  return key;
};

// Encrypte the data
export const encryptUserData = (text: string, key: string) => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

// Decrypt the data
export const decryptUserData = (cipherText: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, key);

  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText;
};

