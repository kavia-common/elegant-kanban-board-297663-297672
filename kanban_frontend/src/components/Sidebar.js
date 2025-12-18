import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../stores/boardStore';
import { createBoard, deleteBoard as deleteBoardAction, updateBoardEmoji } from '../state/boards';
import EmojiPicker from './EmojiPicker';
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
  
  // Zustand stores
  const boards = useBoardStore((state) => state.boards);
  const activeBoard = useBoardStore((state) => state.activeBoard);
  const addBoard = useBoardStore((state) => state.addBoard);
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const updateBoardEmojiStore = useBoardStore((state) => state.updateBoardEmoji);
  
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [emojiPickerState, setEmojiPickerState] = useState({
    isOpen: false,
    boardId: null,
    anchorEl: null
  });

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      try {
        const newBoard = await createBoard({
          title: newBoardTitle.trim()
        });
        addBoard(newBoard);
        setActiveBoard(newBoard.id);
        setNewBoardTitle('');
        setIsCreatingBoard(false);
        navigate(`/board/${newBoard.id}`);
      } catch (error) {
        console.error('Error creating board:', error);
      }
    }
  };

  const handleBoardClick = (boardId) => {
    setActiveBoard(boardId);
    navigate(`/board/${boardId}`);
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation();
    const board = boards.find(b => b.id === boardId);
    if (window.confirm(`Are you sure you want to delete "${board?.title}" board?`)) {
      try {
        await deleteBoardAction(boardId);
        await deleteBoard(boardId);
        
        // Navigate to home if deleting active board
        if (activeBoard === boardId) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  const handleEmojiClick = (boardId, e) => {
    e.stopPropagation();
    setEmojiPickerState({
      isOpen: true,
      boardId: boardId,
      anchorEl: e.currentTarget
    });
  };

  const handleEmojiSelect = async (emoji) => {
    if (emojiPickerState.boardId) {
      try {
        await updateBoardEmoji(emojiPickerState.boardId, emoji);
        updateBoardEmojiStore(emojiPickerState.boardId, emoji);
      } catch (error) {
        console.error('Error updating board emoji:', error);
      }
    }
  };

  const closeEmojiPicker = () => {
    setEmojiPickerState({
      isOpen: false,
      boardId: null,
      anchorEl: null
    });
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
          {boards.map(board => (
            <button
              key={board.id}
              className={`board-item ${activeBoard === board.id ? 'active' : ''}`}
              onClick={() => handleBoardClick(board.id)}
              title={board.title}
            >
              <button
                className="board-icon board-emoji-btn"
                onClick={(e) => handleEmojiClick(board.id, e)}
                aria-label={`Change emoji for ${board.title}`}
                title="Click to change emoji"
              >
                {board.emoji || '📋'}
              </button>
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

      {emojiPickerState.isOpen && (
        <EmojiPicker
          currentEmoji={
            boards.find(b => b.id === emojiPickerState.boardId)?.emoji || '📋'
          }
          onEmojiSelect={handleEmojiSelect}
          onClose={closeEmojiPicker}
          anchorEl={emojiPickerState.anchorEl}
        />
      )}
    </aside>
  );
};

export default Sidebar;
