import React, { useRef, useEffect } from 'react';
import { useAppState, useAppDispatch, ActionTypes } from '../state/store';
import './Header.css';

// PUBLIC_INTERFACE
/**
 * Header component with theme toggle and search functionality
 * @param {Object} props - Component props
 * @param {Function} props.onThemeToggle - Theme toggle handler
 * @param {boolean} props.isDark - Current theme state
 */
const Header = ({ onThemeToggle, isDark }) => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const searchInputRef = useRef(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: e.target.value });
  };

  // Handle clear search
  const handleClearSearch = () => {
    dispatch({ type: ActionTypes.CLEAR_SEARCH_QUERY });
    searchInputRef.current?.focus();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to clear search when input is focused
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        if (state.searchQuery) {
          dispatch({ type: ActionTypes.CLEAR_SEARCH_QUERY });
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.searchQuery, dispatch]);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">Kanban Board</h1>
        </div>
        
        <div className="header-center" role="search">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="search"
              className="search-input"
              placeholder="Search boards, cards... (Ctrl+K)"
              aria-label="Search boards and cards"
              aria-describedby="search-hint"
              value={state.searchQuery}
              onChange={handleSearchChange}
            />
            {state.searchQuery && (
              <button
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
                title="Clear search"
              >
                ×
              </button>
            )}
            <span id="search-hint" className="sr-only">
              Press Ctrl+K to focus search, Escape to clear
            </span>
          </div>
        </div>
        
        <div className="header-right">
          <button
            className="theme-toggle-btn"
            onClick={onThemeToggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
