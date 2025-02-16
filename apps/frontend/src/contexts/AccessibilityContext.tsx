import React, { createContext, useContext, useEffect } from 'react';
import { accessibilityService } from '../services/accessibility.service';
import type { 
  AccessibilityContextType, 
  AccessibilityProviderProps 
} from '../types/accessibility.types';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  initialPreferences,
}) => {
  useEffect(() => {
    if (initialPreferences) {
      Object.entries(initialPreferences).forEach(([key, value]) => {
        accessibilityService.updatePreference(
          key as keyof typeof initialPreferences,
          value
        );
      });
    }

    // Set up keyboard navigation detection
    const handleFirstTab = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-mode');
        window.removeEventListener('keydown', handleFirstTab);
      }
    };

    window.addEventListener('keydown', handleFirstTab);
    return () => window.removeEventListener('keydown', handleFirstTab);
  }, [initialPreferences]);

  const value: AccessibilityContextType = {
    preferences: accessibilityService.getPreferences(),
    updatePreference: accessibilityService.updatePreference.bind(accessibilityService),
    announce: accessibilityService.announceScreenReaderMessage.bind(accessibilityService),
    toggleKeyboardMode: () => {
      const { keyboardNavigation } = accessibilityService.getPreferences();
      if (keyboardNavigation) {
        accessibilityService.disableKeyboardMode();
      } else {
        accessibilityService.enableKeyboardMode();
      }
    },
    setFontSize: accessibilityService.applyFontSize.bind(accessibilityService),
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        data-testid="accessibility-announcer"
      />
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}; 