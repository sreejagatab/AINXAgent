import { useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

interface FocusManagementOptions {
  autoFocus?: boolean;
  trapFocus?: boolean;
  returnFocus?: boolean;
}

export function useFocusManagement(
  containerRef: React.RefObject<HTMLElement>,
  options: FocusManagementOptions = {}
) {
  const { autoFocus = true, trapFocus = false, returnFocus = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (returnFocus && previousFocusRef.current && 'focus' in previousFocusRef.current) {
        try {
          previousFocusRef.current.focus();
        } catch (error) {
          logger.error('Failed to return focus', { error });
        }
      }
    };
  }, [returnFocus]);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        try {
          firstFocusable.focus();
        } catch (error) {
          logger.error('Failed to set initial focus', { error });
        }
      }
    }
  }, [autoFocus, containerRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!trapFocus || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    },
    [trapFocus, containerRef]
  );

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (trapFocus && currentContainer) {
      currentContainer.addEventListener('keydown', handleKeyDown);
      return () => currentContainer.removeEventListener('keydown', handleKeyDown);
    }
  }, [trapFocus, handleKeyDown, containerRef]);

  return {
    focusFirst: useCallback(() => {
      if (containerRef.current) {
        const firstFocusable = getFocusableElements(containerRef.current)[0];
        firstFocusable?.focus();
      }
    }, [containerRef]),
    
    focusLast: useCallback(() => {
      if (containerRef.current) {
        const elements = getFocusableElements(containerRef.current);
        elements[elements.length - 1]?.focus();
      }
    }, [containerRef]),
  };
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(selector))
    .filter(el => {
      const element = el as HTMLElement;
      return !element.hasAttribute('disabled') && 
             element.offsetParent !== null &&
             window.getComputedStyle(element).display !== 'none';
    }) as HTMLElement[];
} 