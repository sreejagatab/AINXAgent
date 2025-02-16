import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { SecurityUtils } from './index';

export class CryptoUtils {
  private static algorithm = 'aes-256-gcm';
  private static keyLength = 32;
  private static ivLength = 16;
  private static saltLength = 64;
  private static tagLength = 16;

  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(this.saltLength).toString('hex');
    const hash = createHash('sha256')
      .update(password + salt)
      .digest('hex');
    return `${salt}:${hash}`;
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const computedHash = createHash('sha256')
      .update(password + salt)
      .digest('hex');
    return hash === computedHash;
  }

  static encrypt(text: string, encryptionKey: string): string {
    const iv = randomBytes(this.ivLength);
    const key = createHash('sha256')
      .update(encryptionKey)
      .digest()
      .slice(0, this.keyLength);

    const cipher = createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  static decrypt(encryptedText: string, encryptionKey: string): string {
    const buffer = Buffer.from(encryptedText, 'base64');
    const iv = buffer.slice(0, this.ivLength);
    const tag = buffer.slice(this.ivLength, this.ivLength + this.tagLength);
    const encrypted = buffer.slice(this.ivLength + this.tagLength);

    const key = createHash('sha256')
      .update(encryptionKey)
      .digest()
      .slice(0, this.keyLength);

    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }

  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}

export class XSSUtils {
  private static htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  static escapeHTML(str: string): string {
    return str.replace(/[&<>"'/]/g, (match) => this.htmlEscapes[match]);
  }

  static sanitizeObject<T extends object>(obj: T): T {
    return Object.entries(obj).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === 'string' ? SecurityUtils.sanitizeInput(value) : value,
    }), {} as T);
  }
} 