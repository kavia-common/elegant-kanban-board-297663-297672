import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import HighlightText from './HighlightText';
import './KanbanCard.css';

// PUBLIC_INTERFACE
/**
 * KanbanCard component for displaying individual cards with search highlighting
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data object
 * @param {number} props.index - Card index in the column
 * @param {Function} props.onEdit - Edit card handler
 * @param {Function} props.onDelete - Delete card handler
 * @param {string} props.searchQuery - Current search query for highlighting
 * @param {boolean} props.isSearchActive - Whether search is currently active
 */
const KanbanCard = ({ card, index, onEdit, onDelete, searchQuery = '', isSearchActive = false }) => {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(card);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className="card-header">
            <h4 className="card-title">
              {isSearchActive ? (
                <HighlightText text={card.title} query={searchQuery} />
              ) : (
                card.title
              )}
            </h4>
            {showActions && (
              <div className="card-actions">
                <button
                  className="card-action-btn"
                  onClick={handleEdit}
                  aria-label="Edit card"
                  title="Edit card"
                >
                  ✏️
                </button>
                <button
                  className="card-action-btn"
                  onClick={handleDelete}
                  aria-label="Delete card"
                  title="Delete card"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
          {card.description && (
            <p className="card-description">
              {isSearchActive ? (
                <HighlightText text={card.description} query={searchQuery} />
              ) : (
                card.description
              )}
            </p>
          )}
          {card.priority && (
            <div className={`card-priority priority-${card.priority}`}>
              {card.priority}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
