import React from 'react';
import './Sidebar.css';

// PUBLIC_INTERFACE
/**
 * Sidebar component for board navigation
 * @param {Object} props - Component props
 * @param {boolean} props.collapsed - Sidebar collapsed state
 * @param {Function} props.onToggle - Toggle sidebar handler
 */
const Sidebar = ({ collapsed = false, onToggle }) => {
  // Placeholder boards data - to be replaced with actual state
  const placeholderBoards = [
    { id: '1', title: 'Project Alpha', starred: true },
    { id: '2', title: 'Sprint Planning', starred: false },
    { id: '3', title: 'Personal Tasks', starred: false }
  ];

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">{!collapsed && 'Boards'}</h2>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="board-list" aria-label="Board navigation">
          {placeholderBoards.map(board => (
            <button
              key={board.id}
              className="board-item"
              title={board.title}
            >
              <span className="board-icon">
                {board.starred ? '⭐' : '📋'}
              </span>
              {!collapsed && (
                <span className="board-title">{board.title}</span>
              )}
            </button>
          ))}
        </nav>
        
        {!collapsed && (
          <button className="add-board-btn">
            <span>+ New Board</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
