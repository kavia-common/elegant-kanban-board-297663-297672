import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { useAppState, useAppDispatch, ActionTypes, boardActions, columnActions, cardActions } from '../state/store';
import KanbanColumn from '../components/KanbanColumn';
import './BoardPage.css';

// PUBLIC_INTERFACE
/**
 * BoardPage component for displaying Kanban board view
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
        // Move card within the same column or to a different column
        const card = state.cards.find(c => c.id === draggableId);
        
        if (sourceColumnId === destColumnId) {
          // Reorder within same column
          const columnCards = state.cards
            .filter(c => c.columnId === sourceColumnId)
            .sort((a, b) => a.position - b.position);
          
          const [movedCard] = columnCards.splice(source.index, 1);
          columnCards.splice(destination.index, 0, movedCard);
          
          // Update positions
          for (let i = 0; i < columnCards.length; i++) {
            const updatedCard = await cardActions.updateCard(columnCards[i].id, {
              ...columnCards[i],
              position: i
            });
            dispatch({ type: ActionTypes.UPDATE_CARD, payload: updatedCard });
          }
        } else {
          // Move to different column
          const updatedCard = await cardActions.moveCard(
            draggableId,
            destColumnId,
            destination.index
          );
          dispatch({ type: ActionTypes.MOVE_CARD, payload: updatedCard });
          
          // Reorder cards in destination column
          const destCards = state.cards
            .filter(c => c.columnId === destColumnId && c.id !== draggableId)
            .sort((a, b) => a.position - b.position);
          
          destCards.splice(destination.index, 0, updatedCard);
          
          for (let i = 0; i < destCards.length; i++) {
            const updated = await cardActions.updateCard(destCards[i].id, {
              ...destCards[i],
              position: i
            });
            dispatch({ type: ActionTypes.UPDATE_CARD, payload: updated });
          }
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

  return (
    <div className="board-page">
      <div className="board-header">
        <h2 className="board-title">{activeBoard.title}</h2>
        {activeBoard.description && (
          <p className="board-description">{activeBoard.description}</p>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {boardColumns
            .sort((a, b) => a.position - b.position)
            .map(column => {
              const columnCards = state.cards
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
                />
              );
            })}

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
        </div>
      </DragDropContext>

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
