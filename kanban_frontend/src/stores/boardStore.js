import { create } from 'zustand';
import StorageService from '../services/storage/StorageService';
import IndexedDBAdapter from '../services/storage/adapters/IndexedDBAdapter';
import storageSchema from '../services/storage/schema';

// Initialize storage service
const storageService = new StorageService(new IndexedDBAdapter(storageSchema));

// Debounce helper for persistence
const createDebouncedPersist = (storeName, delay = 300) => {
  let timeoutId = null;
  
  return (data) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(async () => {
      try {
        await storageService.save(storeName, data);
      } catch (error) {
        console.error(`Error persisting ${storeName}:`, error);
      }
    }, delay);
  };
};

const debouncedPersist = createDebouncedPersist('boards', 300);

// PUBLIC_INTERFACE
/**
 * Board store using Zustand with debounced persistence
 * Manages board state with automatic persistence to IndexedDB
 */
const useBoardStore = create((set, get) => ({
  // State
  boards: [],
  activeBoard: null,
  loading: false,
  error: null,
  initialized: false,

  // PUBLIC_INTERFACE
  /**
   * Initialize the board store by loading data from storage
   * @returns {Promise<void>}
   */
  init: async () => {
    if (get().initialized) return;
    
    set({ loading: true, error: null });
    try {
      await storageService.init();
      const boards = await storageService.getAll('boards');
      set({ 
        boards: boards || [], 
        activeBoard: boards.length > 0 ? boards[0].id : null,
        initialized: true,
        loading: false 
      });
    } catch (error) {
      console.error('Error initializing board store:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Add a new board
   * @param {Object} board - Board object with all properties
   */
  addBoard: (board) => {
    set((state) => {
      const updatedBoards = [...state.boards, board];
      debouncedPersist(board);
      return { boards: updatedBoards };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Update an existing board
   * @param {string} boardId - Board ID
   * @param {Object} updates - Partial board updates
   */
  updateBoard: (boardId, updates) => {
    set((state) => {
      const updatedBoards = state.boards.map((b) =>
        b.id === boardId ? { ...b, ...updates, updatedAt: Date.now() } : b
      );
      const updatedBoard = updatedBoards.find((b) => b.id === boardId);
      if (updatedBoard) {
        debouncedPersist(updatedBoard);
      }
      return { boards: updatedBoards };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Update board emoji
   * @param {string} boardId - Board ID
   * @param {string} emoji - New emoji
   */
  updateBoardEmoji: (boardId, emoji) => {
    get().updateBoard(boardId, { emoji });
  },

  // PUBLIC_INTERFACE
  /**
   * Delete a board
   * @param {string} boardId - Board ID to delete
   */
  deleteBoard: async (boardId) => {
    try {
      await storageService.delete('boards', boardId);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
        activeBoard: state.activeBoard === boardId ? null : state.activeBoard,
      }));
    } catch (error) {
      console.error('Error deleting board:', error);
      set({ error: error.message });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Set the active board
   * @param {string} boardId - Board ID to set as active
   */
  setActiveBoard: (boardId) => {
    set({ activeBoard: boardId });
  },

  // PUBLIC_INTERFACE
  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading: (loading) => {
    set({ loading });
  },

  // PUBLIC_INTERFACE
  /**
   * Set error state
   * @param {string|null} error - Error message
   */
  setError: (error) => {
    set({ error });
  },

  // PUBLIC_INTERFACE
  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));

// Selectors
export const selectBoards = (state) => state.boards;
export const selectActiveBoard = (state) => state.activeBoard;
export const selectActiveBoardData = (state) =>
  state.boards.find((b) => b.id === state.activeBoard);
export const selectLoading = (state) => state.loading;
export const selectError = (state) => state.error;

export default useBoardStore;
