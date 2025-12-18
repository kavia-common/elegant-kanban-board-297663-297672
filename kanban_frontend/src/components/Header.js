import React from 'react';
import useUIStore from '../stores/uiStore';
import useTheme from '../hooks/useTheme';
import './Header.css';

// PUBLIC_INTERFACE
/**
 * Header component with search, theme toggle, and title
 */
const Header = () => {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const clearSearchQuery = useUIStore((state) => state.clearSearchQuery);
  
  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    clearSearchQuery();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Kanban Board</h1>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <input
            type="search"
            className="search-input"
            placeholder="Search boards and cards..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search boards and cards"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header;
