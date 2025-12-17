import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import KanbanCard from './KanbanCard';
import './KanbanColumn.css';

// PUBLIC_INTERFACE
/**
 * KanbanColumn component for displaying columns with cards
 * @param {Object} props - Component props
 * @param {Object} props.column - Column data object
 * @param {Array} props.cards - Array of card objects in this column
 * @param {Function} props.onAddCard - Add card handler
 * @param {Function} props.onEditCard - Edit card handler
 * @param {Function} props.onDeleteCard - Delete card handler
 * @param {Function} props.onEditColumn - Edit column handler
 * @param {Function} props.onDeleteColumn - Delete column handler
 * @param {string} props.searchQuery - Current search query for highlighting
 * @param {boolean} props.isSearchActive - Whether search is currently active
 */
const KanbanColumn = ({ 
  column, 
  cards, 
  onAddCard, 
  onEditCard, 
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
  searchQuery = '',
  isSearchActive = false
}) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [showColumnActions, setShowColumnActions] = useState(false);

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(column.id, { title: newCardTitle.trim() });
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Are you sure you want to delete "${column.title}" column? All cards will be deleted.`)) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <div className="kanban-column">
      <div 
        className="column-header"
        onMouseEnter={() => setShowColumnActions(true)}
        onMouseLeave={() => setShowColumnActions(false)}
      >
        <div className="column-header-left">
          <h3 className="column-title">{column.title}</h3>
          <span className="column-count">{cards.length}</span>
        </div>
        {showColumnActions && (
          <div className="column-actions">
            <button
              className="column-action-btn"
              onClick={() => onEditColumn(column)}
              aria-label="Edit column"
              title="Edit column"
            >
              ✏️
            </button>
            <button
              className="column-action-btn"
              onClick={handleDeleteColumn}
              aria-label="Delete column"
              title="Delete column"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <Droppable droppableId={column.id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                searchQuery={searchQuery}
                isSearchActive={isSearchActive}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="column-footer">
        {isAddingCard ? (
          <form onSubmit={handleAddCard} className="add-card-form">
            <input
              type="text"
              className="add-card-input"
              placeholder="Enter card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onBlur={() => {
                if (!newCardTitle.trim()) setIsAddingCard(false);
              }}
              autoFocus
            />
            <div className="add-card-actions">
              <button type="submit" className="btn-add-card">
                Add
              </button>
              <button
                type="button"
                className="btn-cancel-card"
                onClick={() => {
                  setNewCardTitle('');
                  setIsAddingCard(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="add-card-btn"
            onClick={() => setIsAddingCard(true)}
          >
            + Add Card
          </button>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
