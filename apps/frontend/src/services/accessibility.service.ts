import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { analyticsService } from './analytics.service';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private preferences: AccessibilityPreferences;
  private observers: Set<(prefs: AccessibilityPreferences) => void>;

  private constructor() {
    this.observers = new Set();
    this.preferences = this.loadPreferences();
    this.initializeMediaQueryListeners();
  }

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  private loadPreferences(): AccessibilityPreferences {
    const savedPrefs = storage.getItem('accessibility_preferences');
    const defaultPrefs: AccessibilityPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: more)').matches,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: true,
    };

    return savedPrefs ? { ...defaultPrefs, ...JSON.parse(savedPrefs) } : defaultPrefs;
  }

  private initializeMediaQueryListeners(): void {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.updatePreference('reducedMotion', e.matches);
    });

    window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
      this.updatePreference('highContrast', e.matches);
    });
  }

  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  public updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ): void {
    this.preferences = {
      ...this.preferences,
      [key]: value,
    };

    this.savePreferences();
    this.notifyObservers();

    analyticsService.trackEvent('accessibility_preference_changed', {
      preference: key,
      value,
    });
  }

  private savePreferences(): void {
    try {
      storage.setItem('accessibility_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      logger.error('Failed to save accessibility preferences', { error });
    }
  }

  public subscribe(callback: (prefs: AccessibilityPreferences) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.preferences));
  }

  public announceScreenReaderMessage(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const element = document.createElement('div');
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', priority);
    element.classList.add('sr-only');
    element.textContent = message;

    document.body.appendChild(element);
    setTimeout(() => document.body.removeChild(element), 1000);
  }

  public enableKeyboardMode(): void {
    document.body.classList.add('keyboard-mode');
    this.updatePreference('keyboardNavigation', true);
  }

  public disableKeyboardMode(): void {
    document.body.classList.remove('keyboard-mode');
    this.updatePreference('keyboardNavigation', false);
  }

  public applyFontSize(size: AccessibilityPreferences['fontSize']): void {
    document.documentElement.setAttribute('data-font-size', size);
    this.updatePreference('fontSize', size);
  }
}

export const accessibilityService = AccessibilityService.getInstance(); 