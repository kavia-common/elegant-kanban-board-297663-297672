import { saveToIndexedDB, deleteFromIndexedDB, loadAllFromIndexedDB } from '../utils/storage';

// PUBLIC_INTERFACE
/**
 * Board entity type definition
 * @typedef {Object} Board
 * @property {string} id - Unique board identifier
 * @property {string} title - Board title
 * @property {string} description - Board description
 * @property {string[]} columnOrder - Ordered array of column IDs
 * @property {boolean} starred - Quick access flag
 * @property {string} backgroundColor - Board background color
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
 * Create a new board
 * @param {Object} boardData - Board data
 * @returns {Promise<Board>} Created board object
 */
export const createBoard = async (boardData) => {
  const board = {
    id: generateId(),
    title: boardData.title || 'Untitled Board',
    description: boardData.description || '',
    columnOrder: [],
    starred: false,
    backgroundColor: '#ffffff',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await saveToIndexedDB('boards', board);
  return board;
};

// PUBLIC_INTERFACE
/**
 * Update an existing board
 * @param {string} boardId - Board ID to update
 * @param {Object} updates - Updated board data
 * @returns {Promise<Board>} Updated board object
 */
export const updateBoard = async (boardId, updates) => {
  const updatedBoard = { 
    ...updates, 
    id: boardId, 
    updatedAt: Date.now() 
  };
  
  await saveToIndexedDB('boards', updatedBoard);
  return updatedBoard;
};

// PUBLIC_INTERFACE
/**
 * Delete a board
 * @param {string} boardId - Board ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteBoard = async (boardId) => {
  return await deleteFromIndexedDB('boards', boardId);
};

// PUBLIC_INTERFACE
/**
 * Load all boards
 * @returns {Promise<Board[]>} Array of boards
 */
export const loadBoards = async () => {
  return await loadAllFromIndexedDB('boards');
};

// PUBLIC_INTERFACE
/**
 * Load a single board
 * @param {string} boardId - Board ID
 * @returns {Promise<Board|null>} Board object or null
 */
export const loadBoard = async (boardId) => {
  const boards = await loadAllFromIndexedDB('boards');
  return boards.find(b => b.id === boardId) || null;
};
