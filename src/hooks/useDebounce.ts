import { useEffect, useState } from 'react';

/**
 * Debounces a value by the specified delay.
 * Useful for search input to avoid excessive filtering on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value, updated only after `delay` ms of inactivity
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
