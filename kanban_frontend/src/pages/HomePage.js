import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, ActionTypes, boardActions } from '../state/store';
import './HomePage.css';

// PUBLIC_INTERFACE
/**
 * HomePage component for the root route
 */
const HomePage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const dispatch = useAppDispatch();

  const handleCreateFirstBoard = async () => {
    try {
      const newBoard = await boardActions.createBoard({
        title: 'My First Board',
        description: 'Start organizing your tasks here'
      });
      dispatch({ type: ActionTypes.ADD_BOARD, payload: newBoard });
      dispatch({ type: ActionTypes.SET_ACTIVE_BOARD, payload: newBoard.id });
      navigate(`/board/${newBoard.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const handleSelectBoard = (boardId) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_BOARD, payload: boardId });
    navigate(`/board/${boardId}`);
  };

  if (state.loading) {
    return (
      <div className="home-page">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (state.boards.length === 0) {
    return (
      <div className="home-page">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2 className="empty-state-title">Welcome to Kanban Board</h2>
          <p className="empty-state-description">
            Get started by creating your first board to organize your tasks and projects.
          </p>
          <button className="empty-state-action" onClick={handleCreateFirstBoard}>
            Create Your First Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="boards-overview">
        <h2 className="overview-title">Your Boards</h2>
        <div className="boards-grid">
          {state.boards.map(board => (
            <button
              key={board.id}
              className="board-card"
              onClick={() => handleSelectBoard(board.id)}
            >
              <div className="board-card-header">
                <h3 className="board-card-title">{board.title}</h3>
                {board.starred && <span className="board-star">⭐</span>}
              </div>
              {board.description && (
                <p className="board-card-description">{board.description}</p>
              )}
              <div className="board-card-footer">
                <span className="board-card-date">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
