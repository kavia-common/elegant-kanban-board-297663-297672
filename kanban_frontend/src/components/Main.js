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
        {children || (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h2 className="empty-state-title">No Board Selected</h2>
            <p className="empty-state-description">
              Select a board from the sidebar or create a new one to get started.
            </p>
            <button className="empty-state-action">
              Create Your First Board
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Main;
