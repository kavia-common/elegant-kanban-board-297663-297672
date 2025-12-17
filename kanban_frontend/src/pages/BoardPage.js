import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { useAppState, useAppDispatch, ActionTypes, boardActions, columnActions, cardActions } from '../state/store';
import useDebounce from '../hooks/useDebounce';
import KanbanColumn from '../components/KanbanColumn';
import './BoardPage.css';

// PUBLIC_INTERFACE
/**
 * BoardPage component for displaying Kanban board view with search functionality
 */
const BoardPage = () => {
  const { id: boardIdFromUrl } = useParams();
  const navigate = useNavigate();
  const state = useAppState();
  const dispatch = useAppDispatch();
  
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingCard, setEditingCard] = useState(null);

  const activeBoardId = boardIdFromUrl || state.activeBoard;
  const activeBoard = state.boards.find(b => b.id === activeBoardId);
  const boardColumns = state.columns.filter(c => c.boardId === activeBoardId);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(state.searchQuery, 300);

  // Filter cards and columns based on search query
  const { filteredColumns, totalMatches } = useMemo(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      return {
        filteredColumns: boardColumns,
        totalMatches: 0
      };
    }

    const query = debouncedSearchQuery.toLowerCase();
    let matchCount = 0;
    
    const filtered = boardColumns.map(column => {
      const columnCards = state.cards
        .filter(c => c.columnId === column.id)
        .sort((a, b) => a.position - b.position);

      const matchingCards = columnCards.filter(card => {
        const titleMatch = card.title?.toLowerCase().includes(query);
        const descMatch = card.description?.toLowerCase().includes(query);
        if (titleMatch || descMatch) {
          matchCount++;
          return true;
        }
        return false;
      });

      return {
        ...column,
        cards: matchingCards,
        hasMatches: matchingCards.length > 0
      };
    }).filter(col => col.hasMatches);

    return {
      filteredColumns: filtered,
      totalMatches: matchCount
    };
  }, [boardColumns, state.cards, debouncedSearchQuery]);

  // Load columns and cards when board changes
  useEffect(() => {
    const loadBoardData = async () => {
      if (activeBoardId) {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        try {
          const columns = await columnActions.loadColumns(activeBoardId);
          dispatch({ type: ActionTypes.SET_COLUMNS, payload: columns });
          
          // Load cards for all columns
          const allCards = [];
          for (const column of columns) {
            const cards = await cardActions.loadCards(column.id);
            allCards.push(...cards);
          }
          dispatch({ type: ActionTypes.SET_CARDS, payload: allCards });
        } catch (error) {
          console.error('Error loading board data:', error);
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        } finally {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      }
    };

    loadBoardData();
  }, [activeBoardId, dispatch]);

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (newColumnTitle.trim() && activeBoardId) {
      try {
        const newColumn = await columnActions.createColumn({
          boardId: activeBoardId,
          title: newColumnTitle.trim(),
          position: boardColumns.length
        });
        dispatch({ type: ActionTypes.ADD_COLUMN, payload: newColumn });
        setNewColumnTitle('');
        setIsAddingColumn(false);
      } catch (error) {
        console.error('Error creating column:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  const handleEditColumn = async (column) => {
    const newTitle = window.prompt('Enter new column title:', column.title);
    if (newTitle && newTitle.trim() && newTitle !== column.title) {
      try {
        const updatedColumn = await columnActions.updateColumn(column.id, {
          ...column,
          title: newTitle.trim()
        });
        dispatch({ type: ActionTypes.UPDATE_COLUMN, payload: updatedColumn });
      } catch (error) {
        console.error('Error updating column:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      // Delete all cards in the column
      const cardsToDelete = state.cards.filter(c => c.columnId === columnId);
      for (const card of cardsToDelete) {
        await cardActions.deleteCard(card.id);
        dispatch({ type: ActionTypes.DELETE_CARD, payload: card.id });
      }
      
      // Delete the column
      await columnActions.deleteColumn(columnId);
      dispatch({ type: ActionTypes.DELETE_COLUMN, payload: columnId });
    } catch (error) {
      console.error('Error deleting column:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const handleAddCard = async (columnId, cardData) => {
    try {
      const columnCards = state.cards.filter(c => c.columnId === columnId);
      const newCard = await cardActions.createCard({
        ...cardData,
        columnId,
        position: columnCards.length
      });
      dispatch({ type: ActionTypes.ADD_CARD, payload: newCard });
    } catch (error) {
      console.error('Error creating card:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const handleEditCard = (card) => {
    const newTitle = window.prompt('Enter new card title:', card.title);
    if (newTitle && newTitle.trim() && newTitle !== card.title) {
      handleUpdateCard(card.id, { title: newTitle.trim() });
    }
  };

  const handleUpdateCard = async (cardId, updates) => {
    try {
      const card = state.cards.find(c => c.id === cardId);
      const updatedCard = await cardActions.updateCard(cardId, {
        ...card,
        ...updates
      });
      dispatch({ type: ActionTypes.UPDATE_CARD, payload: updatedCard });
    } catch (error) {
      console.error('Error updating card:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await cardActions.deleteCard(cardId);
      dispatch({ type: ActionTypes.DELETE_CARD, payload: cardId });
    } catch (error) {
      console.error('Error deleting card:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'CARD') {
      const sourceColumnId = source.droppableId;
      const destColumnId = destination.droppableId;

      try {
        if (sourceColumnId === destColumnId) {
          // Reorder within same column
          const columnCards = state.cards
            .filter(c => c.columnId === sourceColumnId)
            .sort((a, b) => a.position - b.position);
          
          // Remove card from source position
          const [movedCard] = columnCards.splice(source.index, 1);
          // Insert at destination position
          columnCards.splice(destination.index, 0, movedCard);
          
          // Batch update all card positions
          const updatePromises = columnCards.map((card, index) => 
            cardActions.updateCard(card.id, {
              ...card,
              position: index
            })
          );
          
          const updatedCards = await Promise.all(updatePromises);
          
          // Batch dispatch all updates
          updatedCards.forEach(updatedCard => {
            dispatch({ type: ActionTypes.UPDATE_CARD, payload: updatedCard });
          });
        } else {
          // Move to different column
          const sourceCards = state.cards
            .filter(c => c.columnId === sourceColumnId)
            .sort((a, b) => a.position - b.position);
          
          const destCards = state.cards
            .filter(c => c.columnId === destColumnId)
            .sort((a, b) => a.position - b.position);
          
          // Find and update the moved card
          const movedCard = sourceCards.find(c => c.id === draggableId);
          const updatedMovedCard = {
            ...movedCard,
            columnId: destColumnId,
            position: destination.index
          };
          
          // Remove from source
          const newSourceCards = sourceCards.filter(c => c.id !== draggableId);
          
          // Insert into destination
          const newDestCards = [...destCards];
          newDestCards.splice(destination.index, 0, updatedMovedCard);
          
          // Prepare all updates
          const updates = [];
          
          // Update moved card
          updates.push(cardActions.updateCard(draggableId, updatedMovedCard));
          
          // Update source column positions
          newSourceCards.forEach((card, index) => {
            if (card.position !== index) {
              updates.push(cardActions.updateCard(card.id, { ...card, position: index }));
            }
          });
          
          // Update destination column positions
          newDestCards.forEach((card, index) => {
            if (card.position !== index) {
              updates.push(cardActions.updateCard(card.id, { ...card, position: index }));
            }
          });
          
          // Execute all updates
          const allUpdatedCards = await Promise.all(updates);
          
          // Batch dispatch
          allUpdatedCards.forEach(updatedCard => {
            dispatch({ type: ActionTypes.UPDATE_CARD, payload: updatedCard });
          });
        }
      } catch (error) {
        console.error('Error moving card:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  if (state.loading) {
    return (
      <div className="board-page board-loading">
        <div className="loading-spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  if (!activeBoardId || !activeBoard) {
    return (
      <div className="board-page board-empty">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2 className="empty-state-title">No Board Selected</h2>
          <p className="empty-state-description">
            Select a board from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  // Determine which columns to show
  const columnsToDisplay = debouncedSearchQuery && debouncedSearchQuery.length >= 2
    ? filteredColumns
    : boardColumns;

  const isSearchActive = debouncedSearchQuery && debouncedSearchQuery.length >= 2;
  const hasNoResults = isSearchActive && totalMatches === 0;

  return (
    <div className="board-page">
      <div className="board-header">
        <h2 className="board-title">{activeBoard.title}</h2>
        {activeBoard.description && (
          <p className="board-description">{activeBoard.description}</p>
        )}
        
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
                {totalMatches} {totalMatches === 1 ? 'match' : 'matches'} found
              </span>
            ) : (
              <span className="result-count no-results">No matches found</span>
            )}
          </div>
        )}
      </div>

      {hasNoResults ? (
        <div className="board-empty-search">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2 className="empty-state-title">No Results Found</h2>
            <p className="empty-state-description">
              No cards match your search for "<strong>{debouncedSearchQuery}</strong>".
              Try a different search term.
            </p>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="board-columns">
            {columnsToDisplay
              .sort((a, b) => a.position - b.position)
              .map(column => {
                const columnCards = isSearchActive
                  ? column.cards || []
                  : state.cards
                      .filter(c => c.columnId === column.id)
                      .sort((a, b) => a.position - b.position);

                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    cards={columnCards}
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                    onEditColumn={handleEditColumn}
                    onDeleteColumn={handleDeleteColumn}
                    searchQuery={isSearchActive ? debouncedSearchQuery : ''}
                    isSearchActive={isSearchActive}
                  />
                );
              })}

            {!isSearchActive && (
              <div className="add-column-container">
                {isAddingColumn ? (
                  <form onSubmit={handleAddColumn} className="add-column-form">
                    <input
                      type="text"
                      className="add-column-input"
                      placeholder="Enter column title..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onBlur={() => {
                        if (!newColumnTitle.trim()) setIsAddingColumn(false);
                      }}
                      autoFocus
                    />
                    <div className="add-column-actions">
                      <button type="submit" className="btn-add-column">
                        Add Column
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-column"
                        onClick={() => {
                          setNewColumnTitle('');
                          setIsAddingColumn(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="add-column-btn"
                    onClick={() => setIsAddingColumn(true)}
                  >
                    + Add Column
                  </button>
                )}
              </div>
            )}
          </div>
        </DragDropContext>
      )}

      {state.error && (
        <div className="error-toast">
          <span>{state.error}</span>
          <button onClick={() => dispatch({ type: ActionTypes.SET_ERROR, payload: null })}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
