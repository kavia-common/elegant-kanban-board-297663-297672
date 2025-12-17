import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './KanbanCard.css';

// PUBLIC_INTERFACE
/**
 * KanbanCard component for displaying individual cards
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data object
 * @param {number} props.index - Card index in the column
 * @param {Function} props.onEdit - Edit card handler
 * @param {Function} props.onDelete - Delete card handler
 */
const KanbanCard = ({ card, index, onEdit, onDelete }) => {
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
            <h4 className="card-title">{card.title}</h4>
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
            <p className="card-description">{card.description}</p>
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
