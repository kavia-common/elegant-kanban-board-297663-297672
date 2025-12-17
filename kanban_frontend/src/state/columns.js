import { saveToIndexedDB, deleteFromIndexedDB, loadAllFromIndexedDB } from '../utils/storage';

// PUBLIC_INTERFACE
/**
 * Column entity type definition
 * @typedef {Object} Column
 * @property {string} id - Unique column identifier
 * @property {string} boardId - Parent board ID
 * @property {string} title - Column title
 * @property {string[]} cardOrder - Ordered array of card IDs
 * @property {number} position - Sort order within board
 * @property {string|null} color - Optional header color
 * @property {number|null} cardLimit - WIP limit (null = unlimited)
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

// PUBLIC_INTERFACE
/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// PUBLIC_INTERFACE
/**
 * Create a new column
 * @param {Object} columnData - Column data
 * @returns {Promise<Column>} Created column object
 */
export const createColumn = async (columnData) => {
  const column = {
    id: generateId(),
    boardId: columnData.boardId,
    title: columnData.title || 'Untitled Column',
    cardOrder: [],
    position: columnData.position || 0,
    color: null,
    cardLimit: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await saveToIndexedDB('columns', column);
  return column;
};

// PUBLIC_INTERFACE
/**
 * Update an existing column
 * @param {string} columnId - Column ID to update
 * @param {Object} updates - Updated column data
 * @returns {Promise<Column>} Updated column object
 */
export const updateColumn = async (columnId, updates) => {
  const updatedColumn = { 
    ...updates, 
    id: columnId, 
    updatedAt: Date.now() 
  };
  
  await saveToIndexedDB('columns', updatedColumn);
  return updatedColumn;
};

// PUBLIC_INTERFACE
/**
 * Delete a column
 * @param {string} columnId - Column ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteColumn = async (columnId) => {
  return await deleteFromIndexedDB('columns', columnId);
};

// PUBLIC_INTERFACE
/**
 * Load all columns for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Column[]>} Array of columns
 */
export const loadColumns = async (boardId) => {
  const allColumns = await loadAllFromIndexedDB('columns');
  return allColumns
    .filter(col => col.boardId === boardId)
    .sort((a, b) => a.position - b.position);
};

// PUBLIC_INTERFACE
/**
 * Load a single column
 * @param {string} columnId - Column ID
 * @returns {Promise<Column|null>} Column object or null
 */
export const loadColumn = async (columnId) => {
  const columns = await loadAllFromIndexedDB('columns');
  return columns.find(c => c.id === columnId) || null;
};
