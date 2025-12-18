import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import useBoardStore from '../stores/boardStore';
import useColumnStore from '../stores/columnStore';
import useCardStore from '../stores/cardStore';
import useUIStore from '../stores/uiStore';
import { createColumn, updateColumn, deleteColumn } from '../state/columns';
import { createCard, updateCard, deleteCard } from '../state/cards';
import useDebounce from '../hooks/useDebounce';
import KanbanColumn from '../components/KanbanColumn';
import './BoardPage.css';

// PUBLIC_INTERFACE
/**
 * BoardPage component for displaying Kanban board view with search functionality
 */
const BoardPage = () => {
  const { id: boardIdFromUrl } = useParams();
  
  // Zustand stores
  const boards = useBoardStore((state) => state.boards);
  const activeBoard = useBoardStore((state) => state.activeBoard);
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const boardLoading = useBoardStore((state) => state.loading);
  const boardError = useBoardStore((state) => state.error);
  
  const columns = useColumnStore((state) => state.columns);
  const loadColumns = useColumnStore((state) => state.loadColumns);
  const addColumn = useColumnStore((state) => state.addColumn);
  const updateColumnStore = useColumnStore((state) => state.updateColumn);
  const deleteColumnStore = useColumnStore((state) => state.deleteColumn);
  const columnLoading = useColumnStore((state) => state.loading);
  
  const cards = useCardStore((state) => state.cards);
  const loadCards = useCardStore((state) => state.loadCards);
  const addCard = useCardStore((state) => state.addCard);
  const updateCardStore = useCardStore((state) => state.updateCard);
  const deleteCardStore = useCardStore((state) => state.deleteCard);
  const batchUpdateCards = useCardStore((state) => state.batchUpdateCards);
  
  const searchQuery = useUIStore((state) => state.searchQuery);
  
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const activeBoardId = boardIdFromUrl || activeBoard;
  const activeBoardData = boards.find(b => b.id === activeBoardId);
  const boardColumns = columns.filter(c => c.boardId === activeBoardId);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
      const columnCards = cards
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
  }, [boardColumns, cards, debouncedSearchQuery]);

  // Load columns and cards when board changes
  useEffect(() => {
    const loadBoardData = async () => {
      if (activeBoardId) {
        try {
          await loadColumns(activeBoardId);
          const columnIds = columns
            .filter(c => c.boardId === activeBoardId)
            .map(c => c.id);
          if (columnIds.length > 0) {
            await loadCards(columnIds);
          }
        } catch (error) {
          console.error('Error loading board data:', error);
        }
      }
    };

    loadBoardData();
  }, [activeBoardId, loadColumns, loadCards, columns]);

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (newColumnTitle.trim() && activeBoardId) {
      try {
        const newColumn = await createColumn({
          boardId: activeBoardId,
          title: newColumnTitle.trim(),
          position: boardColumns.length
        });
        addColumn(newColumn);
        setNewColumnTitle('');
        setIsAddingColumn(false);
      } catch (error) {
        console.error('Error creating column:', error);
      }
    }
  };

  const handleEditColumn = async (column) => {
    const newTitle = window.prompt('Enter new column title:', column.title);
    if (newTitle && newTitle.trim() && newTitle !== column.title) {
      try {
        const updatedColumn = await updateColumn(column.id, {
          ...column,
          title: newTitle.trim()
        });
        updateColumnStore(column.id, updatedColumn);
      } catch (error) {
        console.error('Error updating column:', error);
      }
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      // Delete all cards in the column
      const cardsToDelete = cards.filter(c => c.columnId === columnId);
      for (const card of cardsToDelete) {
        await deleteCard(card.id);
        await deleteCardStore(card.id);
      }
      
      // Delete the column
      await deleteColumn(columnId);
      await deleteColumnStore(columnId);
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const handleAddCard = async (columnId, cardData) => {
    try {
      const columnCards = cards.filter(c => c.columnId === columnId);
      const newCard = await createCard({
        ...cardData,
        columnId,
        position: columnCards.length
      });
      addCard(newCard);
    } catch (error) {
      console.error('Error creating card:', error);
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
      const card = cards.find(c => c.id === cardId);
      const updatedCard = await updateCard(cardId, {
        ...card,
        ...updates
      });
      updateCardStore(cardId, updatedCard);
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCard(cardId);
      await deleteCardStore(cardId);
    } catch (error) {
      console.error('Error deleting card:', error);
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
          const columnCards = cards
            .filter(c => c.columnId === sourceColumnId)
            .sort((a, b) => a.position - b.position);
          
          // Remove card from source position
          const [movedCard] = columnCards.splice(source.index, 1);
          // Insert at destination position
          columnCards.splice(destination.index, 0, movedCard);
          
          // Batch update all card positions
          const updatePromises = columnCards.map((card, index) => 
            updateCard(card.id, {
              ...card,
              position: index
            })
          );
          
          await Promise.all(updatePromises);
          
          // Batch update store
          const cardUpdates = columnCards.map((card, index) => ({
            id: card.id,
            updates: { position: index }
          }));
          batchUpdateCards(cardUpdates);
        } else {
          // Move to different column
          const sourceCards = cards
            .filter(c => c.columnId === sourceColumnId)
            .sort((a, b) => a.position - b.position);
          
          const destCards = cards
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
          const storeUpdates = [];
          
          // Update moved card
          updates.push(updateCard(draggableId, updatedMovedCard));
          storeUpdates.push({ id: draggableId, updates: { columnId: destColumnId, position: destination.index } });
          
          // Update source column positions
          newSourceCards.forEach((card, index) => {
            if (card.position !== index) {
              updates.push(updateCard(card.id, { ...card, position: index }));
              storeUpdates.push({ id: card.id, updates: { position: index } });
            }
          });
          
          // Update destination column positions
          newDestCards.forEach((card, index) => {
            if (card.position !== index && card.id !== draggableId) {
              updates.push(updateCard(card.id, { ...card, position: index }));
              storeUpdates.push({ id: card.id, updates: { position: index } });
            }
          });
          
          // Execute all updates
          await Promise.all(updates);
          
          // Batch update store
          batchUpdateCards(storeUpdates);
        }
      } catch (error) {
        console.error('Error moving card:', error);
      }
    }
  };

  const loading = boardLoading || columnLoading;

  if (loading) {
    return (
      <div className="board-page board-loading">
        <div className="loading-spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  if (!activeBoardId || !activeBoardData) {
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
        <h2 className="board-title">{activeBoardData.title}</h2>
        {activeBoardData.description && (
          <p className="board-description">{activeBoardData.description}</p>
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
                  : cards
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

      {boardError && (
        <div className="error-toast">
          <span>{boardError}</span>
          <button onClick={() => useBoardStore.getState().clearError()}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
