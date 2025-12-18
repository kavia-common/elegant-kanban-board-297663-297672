/**
 * Storage schema definition for IndexedDB
 * Defines database structure, version, and indexes
 */
const storageSchema = {
  name: 'kanban-app-db',
  version: 1,
  stores: {
    // Boards store
    boards: 'id, createdAt, starred, archived',
    
    // Columns store
    columns: 'id, boardId, position',
    
    // Cards store
    cards: 'id, columnId, position, dueDate, priority',
    
    // Labels store
    labels: 'id, boardId',
    
    // Settings store
    settings: 'key'
  }
};

export default storageSchema;
