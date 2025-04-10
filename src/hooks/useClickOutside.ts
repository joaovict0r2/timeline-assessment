import { useEffect, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent) => void,
  className?: string
): void {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current) return;
      
      if (ref.current.contains(event.target as Node)) {
        return;
      }
      
      if (className) {
        const target = event.target as HTMLElement;
        if (target.closest(`.${className}`)) {
          return;
        }
      }

      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler, className]);
} 