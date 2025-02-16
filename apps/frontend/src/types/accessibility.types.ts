export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

export interface FocusableElement extends HTMLElement {
  focus(): void;
  blur(): void;
}

export interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  toggleKeyboardMode: () => void;
  setFontSize: (size: AccessibilityPreferences['fontSize']) => void;
}

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  initialPreferences?: Partial<AccessibilityPreferences>;
}

export type FocusStrategy = 'first' | 'last' | 'closest';

export interface FocusManagerOptions {
  containerRef: React.RefObject<HTMLElement>;
  autoFocus?: boolean;
  trapFocus?: boolean;
  returnFocus?: boolean;
  focusStrategy?: FocusStrategy;
} 