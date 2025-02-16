import Cookies from 'js-cookie';
import { getEnvironment } from '../config/environment';

export class Storage {
  private static instance: Storage;

  private constructor() {}

  public static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  // Local Storage Methods
  public setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  public getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Cookie Methods
  public setCookie(key: string, value: string, options?: Cookies.CookieAttributes): void {
    const { AUTH_COOKIE_DOMAIN } = getEnvironment();
    
    Cookies.set(key, value, {
      domain: AUTH_COOKIE_DOMAIN,
      secure: true,
      sameSite: 'strict',
      ...options,
    });
  }

  public getCookie(key: string): string | undefined {
    return Cookies.get(key);
  }

  public removeCookie(key: string, options?: Cookies.CookieAttributes): void {
    const { AUTH_COOKIE_DOMAIN } = getEnvironment();
    
    Cookies.remove(key, {
      domain: AUTH_COOKIE_DOMAIN,
      ...options,
    });
  }

  // Session Storage Methods
  public setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  public getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }

  public removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }

  // Clear All Storage
  public clearAll(): void {
    try {
      localStorage.clear();
      sessionStorage.clear();
      const cookies = Cookies.get();
      Object.keys(cookies).forEach(cookie => this.removeCookie(cookie));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storage = Storage.getInstance(); 