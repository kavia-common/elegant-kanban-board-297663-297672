import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../stores/boardStore';
import useUIStore from '../stores/uiStore';
import { createBoard } from '../state/boards';
import useDebounce from '../hooks/useDebounce';
import HighlightText from '../components/HighlightText';
import './HomePage.css';

// PUBLIC_INTERFACE
/**
 * HomePage component for the root route with search functionality
 */
const HomePage = () => {
  const navigate = useNavigate();
  
  // Zustand stores
  const boards = useBoardStore((state) => state.boards);
  const addBoard = useBoardStore((state) => state.addBoard);
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const loading = useBoardStore((state) => state.loading);
  
  const searchQuery = useUIStore((state) => state.searchQuery);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter boards based on search query
  const { filteredBoards, totalMatches } = useMemo(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      return {
        filteredBoards: boards,
        totalMatches: 0
      };
    }

    const query = debouncedSearchQuery.toLowerCase();
    const filtered = boards.filter(board => {
      const titleMatch = board.title?.toLowerCase().includes(query);
      const descMatch = board.description?.toLowerCase().includes(query);
      return titleMatch || descMatch;
    });

    return {
      filteredBoards: filtered,
      totalMatches: filtered.length
    };
  }, [boards, debouncedSearchQuery]);

  const handleCreateFirstBoard = async () => {
    try {
      const newBoard = await createBoard({
        title: 'My First Board',
        description: 'Start organizing your tasks here'
      });
      addBoard(newBoard);
      setActiveBoard(newBoard.id);
      navigate(`/board/${newBoard.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleSelectBoard = (boardId) => {
    setActiveBoard(boardId);
    navigate(`/board/${boardId}`);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (boards.length === 0) {
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

  const isSearchActive = debouncedSearchQuery && debouncedSearchQuery.length >= 2;
  const hasNoResults = isSearchActive && totalMatches === 0;

  return (
    <div className="home-page">
      <div className="boards-overview">
        <h2 className="overview-title">Your Boards</h2>
        
        {/* Search result count with accessibility */}
        {isSearchActive && (
          <div 
            className="search-results-info" 
            role="status" 
            aria-live="polite"
            aria-atomic="true"
          >
            {totalMatches > 0 ? (
              <span className="result-count">
                {totalMatches} {totalMatches === 1 ? 'board' : 'boards'} found
              </span>
            ) : (
              <span className="result-count no-results">No boards found</span>
            )}
          </div>
        )}

        {hasNoResults ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2 className="empty-state-title">No Boards Found</h2>
            <p className="empty-state-description">
              No boards match your search for "<strong>{debouncedSearchQuery}</strong>".
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="boards-grid">
            {filteredBoards.map(board => (
              <button
                key={board.id}
                className="board-card"
                onClick={() => handleSelectBoard(board.id)}
              >
                <div className="board-card-header">
                  <h3 className="board-card-title">
                    {isSearchActive ? (
                      <HighlightText text={board.title} query={debouncedSearchQuery} />
                    ) : (
                      board.title
                    )}
                  </h3>
                  {board.starred && <span className="board-star">⭐</span>}
                </div>
                {board.description && (
                  <p className="board-card-description">
                    {isSearchActive ? (
                      <HighlightText text={board.description} query={debouncedSearchQuery} />
                    ) : (
                      board.description
                    )}
                  </p>
                )}
                <div className="board-card-footer">
                  <span className="board-card-date">
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
