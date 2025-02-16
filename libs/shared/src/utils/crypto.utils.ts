import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class CryptoUtils {
  private static readonly SALT_ROUNDS = 10;
  private static readonly HASH_ALGORITHM = 'sha256';
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateRandomString(length: number): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  static hashString(str: string): string {
    return crypto
      .createHash(this.HASH_ALGORITHM)
      .update(str)
      .digest('hex');
  }

  static encrypt(text: string, secretKey: string): {
    encrypted: string;
    iv: string;
    authTag: string;
  } {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = crypto
      .scryptSync(secretKey, 'salt', this.KEY_LENGTH)
      .toString('hex')
      .slice(0, 32);

    const cipher = crypto.createCipheriv(
      this.ENCRYPTION_ALGORITHM,
      Buffer.from(key, 'hex'),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  static decrypt(
    encrypted: string,
    iv: string,
    authTag: string,
    secretKey: string
  ): string {
    const key = crypto
      .scryptSync(secretKey, 'salt', this.KEY_LENGTH)
      .toString('hex')
      .slice(0, 32);

    const decipher = crypto.createDecipheriv(
      this.ENCRYPTION_ALGORITHM,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
} 