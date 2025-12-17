import React from 'react';
import './Main.css';

// PUBLIC_INTERFACE
/**
 * Main content area for Kanban board canvas
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
const Main = ({ children }) => {
  return (
    <main className="app-main" role="main" aria-label="Kanban Board Canvas">
      <div className="main-content">
        {children}
      </div>
    </main>
  );
};

export default Main;
