import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'kanban-theme-preference';

// PUBLIC_INTERFACE
/**
 * Custom hook for managing theme state with localStorage persistence
 * @returns {Object} Theme state and toggle function
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or default to 'light'
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply theme attribute to document element
    document.documentElement.setAttribute('data-theme', theme);
    
    // Persist theme preference
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
};

export default useTheme;
