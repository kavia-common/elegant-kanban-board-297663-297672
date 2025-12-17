import { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
/**
 * Custom hook to debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {any} The debounced value
 * 
 * @example
 * const debouncedSearchQuery = useDebounce(searchQuery, 300);
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
