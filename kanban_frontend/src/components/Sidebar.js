import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, ActionTypes, boardActions } from '../state/store';
import './Sidebar.css';

// PUBLIC_INTERFACE
/**
 * Sidebar component for board navigation
 * @param {Object} props - Component props
 * @param {boolean} props.collapsed - Sidebar collapsed state
 * @param {Function} props.onToggle - Toggle sidebar handler
 */
const Sidebar = ({ collapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      try {
        const newBoard = await boardActions.createBoard({
          title: newBoardTitle.trim()
        });
        dispatch({ type: ActionTypes.ADD_BOARD, payload: newBoard });
        dispatch({ type: ActionTypes.SET_ACTIVE_BOARD, payload: newBoard.id });
        setNewBoardTitle('');
        setIsCreatingBoard(false);
        navigate(`/board/${newBoard.id}`);
      } catch (error) {
        console.error('Error creating board:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  const handleBoardClick = (boardId) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_BOARD, payload: boardId });
    navigate(`/board/${boardId}`);
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation();
    const board = state.boards.find(b => b.id === boardId);
    if (window.confirm(`Are you sure you want to delete "${board?.title}" board?`)) {
      try {
        await boardActions.deleteBoard(boardId);
        dispatch({ type: ActionTypes.DELETE_BOARD, payload: boardId });
        
        // Navigate to home if deleting active board
        if (state.activeBoard === boardId) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting board:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

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
          {state.boards.map(board => (
            <button
              key={board.id}
              className={`board-item ${state.activeBoard === board.id ? 'active' : ''}`}
              onClick={() => handleBoardClick(board.id)}
              title={board.title}
            >
              <span className="board-icon">
                {board.starred ? '⭐' : '📋'}
              </span>
              {!collapsed && (
                <>
                  <span className="board-title">{board.title}</span>
                  <button
                    className="board-delete-btn"
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    aria-label="Delete board"
                    title="Delete board"
                  >
                    🗑️
                  </button>
                </>
              )}
            </button>
          ))}
        </nav>
        
        {!collapsed && (
          <>
            {isCreatingBoard ? (
              <form onSubmit={handleCreateBoard} className="create-board-form">
                <input
                  type="text"
                  className="create-board-input"
                  placeholder="Enter board title..."
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onBlur={() => {
                    if (!newBoardTitle.trim()) setIsCreatingBoard(false);
                  }}
                  autoFocus
                />
                <div className="create-board-actions">
                  <button type="submit" className="btn-create">
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setNewBoardTitle('');
                      setIsCreatingBoard(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button 
                className="add-board-btn"
                onClick={() => setIsCreatingBoard(true)}
              >
                <span>+ New Board</span>
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
