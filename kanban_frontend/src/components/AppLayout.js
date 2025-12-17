import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Main from './Main';
import './AppLayout.css';

// PUBLIC_INTERFACE
/**
 * AppLayout component composing Header, Sidebar, and Main content area
 * @param {Object} props - Component props
 * @param {Function} props.onThemeToggle - Theme toggle handler
 * @param {boolean} props.isDark - Current theme state
 * @param {React.ReactNode} props.children - Content for main area
 */
const AppLayout = ({ onThemeToggle, isDark, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      <Header onThemeToggle={onThemeToggle} isDark={isDark} />
      <div className="app-body">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={handleSidebarToggle}
        />
        <Main>{children}</Main>
      </div>
    </div>
  );
};

export default AppLayout;
