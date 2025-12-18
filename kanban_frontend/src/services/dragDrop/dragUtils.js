/**
 * Drag and drop utility functions
 * Helper functions for drag operations, reordering, and collision detection
 */

// PUBLIC_INTERFACE
/**
 * Reorder items in an array
 * @param {Array} list - The list to reorder
 * @param {number} startIndex - Source index
 * @param {number} endIndex - Destination index
 * @returns {Array} New reordered array
 */
export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// PUBLIC_INTERFACE
/**
 * Move item between lists
 * @param {Array} source - Source list
 * @param {Array} destination - Destination list
 * @param {number} sourceIndex - Source index
 * @param {number} destinationIndex - Destination index
 * @returns {Object} Object with updated source and destination arrays
 */
export const move = (source, destination, sourceIndex, destinationIndex) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(sourceIndex, 1);

  destClone.splice(destinationIndex, 0, removed);

  return {
    source: sourceClone,
    destination: destClone
  };
};

// PUBLIC_INTERFACE
/**
 * Update positions for items after reordering
 * @param {Array} items - Array of items with position property
 * @returns {Array} Items with updated position values
 */
export const updatePositions = (items) => {
  return items.map((item, index) => ({
    ...item,
    position: index
  }));
};

// PUBLIC_INTERFACE
/**
 * Calculate drop position based on cursor coordinates
 * @param {Array} items - List of items
 * @param {Object} monitor - Drag monitor object
 * @param {Object} component - Component ref
 * @returns {number} Calculated drop index
 */
export const calculateDropPosition = (items, monitor, component) => {
  if (!monitor || !component) return items.length;
  
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return items.length;

  const hoverBoundingRect = component.getBoundingClientRect();
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  // Determine position based on cursor position
  if (hoverClientY < hoverMiddleY) {
    return 0;
  }
  
  return items.length;
};

// PUBLIC_INTERFACE
/**
 * Check if drag is valid based on type and context
 * @param {string} dragType - Type of item being dragged
 * @param {string} dropZoneType - Type of drop zone
 * @param {Object} item - Item being dragged
 * @param {Object} target - Drop target
 * @returns {boolean} Whether drop is valid
 */
export const isValidDrop = (dragType, dropZoneType, item, target) => {
  // Basic type matching
  if (dragType !== dropZoneType) return false;
  
  // Prevent dropping item onto itself
  if (item.id === target.id) return false;
  
  return true;
};

// PUBLIC_INTERFACE
/**
 * Get drag preview style
 * @param {boolean} isDragging - Whether item is being dragged
 * @param {Object} customStyle - Custom style overrides
 * @returns {Object} Style object
 */
export const getDragPreviewStyle = (isDragging, customStyle = {}) => {
  return {
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    ...customStyle
  };
};

// PUBLIC_INTERFACE
/**
 * Handle drag start event
 * @param {Object} item - Item being dragged
 * @param {Function} callback - Optional callback
 */
export const handleDragStart = (item, callback) => {
  if (callback) {
    callback(item);
  }
  
  // Add dragging class to body for global styling
  document.body.classList.add('is-dragging');
};

// PUBLIC_INTERFACE
/**
 * Handle drag end event
 * @param {Function} callback - Optional callback
 */
export const handleDragEnd = (callback) => {
  if (callback) {
    callback();
  }
  
  // Remove dragging class from body
  document.body.classList.remove('is-dragging');
};

// PUBLIC_INTERFACE
/**
 * Create drag data transfer object
 * @param {Object} item - Item being dragged
 * @param {string} type - Drag type
 * @returns {Object} Data transfer object
 */
export const createDragData = (item, type) => {
  return {
    id: item.id,
    type,
    sourceIndex: item.position || 0,
    timestamp: Date.now()
  };
};
