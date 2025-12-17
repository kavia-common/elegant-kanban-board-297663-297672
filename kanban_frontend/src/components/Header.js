import React from 'react';
import './Header.css';

// PUBLIC_INTERFACE
/**
 * Header component with theme toggle and search functionality
 * @param {Object} props - Component props
 * @param {Function} props.onThemeToggle - Theme toggle handler
 * @param {boolean} props.isDark - Current theme state
 */
const Header = ({ onThemeToggle, isDark }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">Kanban Board</h1>
        </div>
        
        <div className="header-center">
          <input
            type="search"
            className="search-input"
            placeholder="Search boards, cards..."
            aria-label="Search"
          />
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
