import { reorder, move, updatePositions } from './dragUtils';

/**
 * DragDropService - Centralized drag and drop state management
 * Handles drag operations, reordering, and state updates
 */
class DragDropService {
  constructor() {
    this.dragState = {
      isDragging: false,
      draggedItem: null,
      dragType: null,
      sourceId: null
    };
    this.listeners = [];
  }

  // PUBLIC_INTERFACE
  /**
   * Start a drag operation
   * @param {Object} item - Item being dragged
   * @param {string} type - Drag type
   * @param {string} sourceId - Source container ID
   */
  startDrag(item, type, sourceId) {
    this.dragState = {
      isDragging: true,
      draggedItem: item,
      dragType: type,
      sourceId
    };
    this.notifyListeners('dragStart', this.dragState);
  }

  // PUBLIC_INTERFACE
  /**
   * End a drag operation
   */
  endDrag() {
    const previousState = { ...this.dragState };
    this.dragState = {
      isDragging: false,
      draggedItem: null,
      dragType: null,
      sourceId: null
    };
    this.notifyListeners('dragEnd', previousState);
  }

  // PUBLIC_INTERFACE
  /**
   * Handle drop operation
   * @param {string} destinationId - Destination container ID
   * @param {number} destinationIndex - Drop index
   * @returns {Object} Drop result with updated items
   */
  handleDrop(destinationId, destinationIndex) {
    if (!this.dragState.isDragging) return null;

    const result = {
      item: this.dragState.draggedItem,
      type: this.dragState.dragType,
      sourceId: this.dragState.sourceId,
      destinationId,
      destinationIndex
    };

    this.notifyListeners('drop', result);
    return result;
  }

  // PUBLIC_INTERFACE
  /**
   * Reorder items within the same container
   * @param {Array} items - Items to reorder
   * @param {number} sourceIndex - Source index
   * @param {number} destinationIndex - Destination index
   * @returns {Array} Reordered items with updated positions
   */
  reorderItems(items, sourceIndex, destinationIndex) {
    const reordered = reorder(items, sourceIndex, destinationIndex);
    return updatePositions(reordered);
  }

  // PUBLIC_INTERFACE
  /**
   * Move item between containers
   * @param {Array} sourceItems - Source container items
   * @param {Array} destItems - Destination container items
   * @param {number} sourceIndex - Source index
   * @param {number} destinationIndex - Destination index
   * @returns {Object} Updated source and destination arrays
   */
  moveItem(sourceItems, destItems, sourceIndex, destinationIndex) {
    const { source, destination } = move(
      sourceItems,
      destItems,
      sourceIndex,
      destinationIndex
    );

    return {
      source: updatePositions(source),
      destination: updatePositions(destination)
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Subscribe to drag/drop events
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Get current drag state
   * @returns {Object} Current drag state
   */
  getDragState() {
    return { ...this.dragState };
  }

  /**
   * Notify all listeners of an event
   * @private
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (err) {
        console.error('Error in drag/drop listener:', err);
      }
    });
  }
}

// Singleton instance
let dragDropServiceInstance = null;

// PUBLIC_INTERFACE
/**
 * Get the DragDropService singleton instance
 * @returns {DragDropService} Service instance
 */
export const getDragDropService = () => {
  if (!dragDropServiceInstance) {
    dragDropServiceInstance = new DragDropService();
  }
  return dragDropServiceInstance;
};

export default DragDropService;
