import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte key from the configured encryption key
 */
const getKey = () => {
  return crypto.createHash('sha256').update(String(env.CREDENTIAL_ENCRYPTION_KEY)).digest();
};

/**
 * Encrypts arbitrary data (string or object)
 * @param {any} data 
 * @returns {{ iv: string, encryptedData: string, tag: string }}
 */
export const encryptCredential = (data) => {
  if (data === null || data === undefined) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    tag: tag.toString('hex'),
  };
};

/**
 * Decrypts encrypted payload
 * @param {{ iv: string, encryptedData: string, tag: string }} payload 
 * @returns {any}
 */
export const decryptCredential = (payload) => {
  if (!payload || !payload.iv || !payload.encryptedData || !payload.tag) {
    return null;
  }
  try {
    const key = getKey();
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('[EncryptionService] Decryption failed:', error.message);
    throw new Error('AUTH_DECRYPTION_FAILED');
  }
};
