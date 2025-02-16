import { useEffect, useCallback, useState } from 'react';
import { accessibilityService } from '../services/accessibility.service';
import type { AccessibilityPreferences } from '../types/accessibility.types';

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    accessibilityService.getPreferences()
  );

  useEffect(() => {
    return accessibilityService.subscribe(setPreferences);
  }, []);

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    accessibilityService.updatePreference(key, value);
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityService.announceScreenReaderMessage(message, priority);
  }, []);

  const toggleKeyboardMode = useCallback(() => {
    if (preferences.keyboardNavigation) {
      accessibilityService.disableKeyboardMode();
    } else {
      accessibilityService.enableKeyboardMode();
    }
  }, [preferences.keyboardNavigation]);

  const setFontSize = useCallback((size: AccessibilityPreferences['fontSize']) => {
    accessibilityService.applyFontSize(size);
  }, []);

  return {
    preferences,
    updatePreference,
    announce,
    toggleKeyboardMode,
    setFontSize,
  };
} 