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

const debouncedPersist = createDebouncedPersist('columns', 300);

// PUBLIC_INTERFACE
/**
 * Column store using Zustand with debounced persistence
 * Manages column state with automatic persistence to IndexedDB
 */
const useColumnStore = create((set, get) => ({
  // State
  columns: [],
  loading: false,
  error: null,
  initialized: false,

  // PUBLIC_INTERFACE
  /**
   * Initialize the column store by loading data from storage
   * @returns {Promise<void>}
   */
  init: async () => {
    if (get().initialized) return;
    
    set({ loading: true, error: null });
    try {
      await storageService.init();
      const columns = await storageService.getAll('columns');
      set({ 
        columns: columns || [], 
        initialized: true,
        loading: false 
      });
    } catch (error) {
      console.error('Error initializing column store:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Load columns for a specific board
   * @param {string} boardId - Board ID
   */
  loadColumns: async (boardId) => {
    set({ loading: true, error: null });
    try {
      await storageService.init();
      const allColumns = await storageService.getAll('columns');
      const boardColumns = allColumns
        .filter((col) => col.boardId === boardId)
        .sort((a, b) => a.position - b.position);
      set({ columns: boardColumns, loading: false });
    } catch (error) {
      console.error('Error loading columns:', error);
      set({ error: error.message, loading: false });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Add a new column
   * @param {Object} column - Column object with all properties
   */
  addColumn: (column) => {
    set((state) => {
      const updatedColumns = [...state.columns, column];
      debouncedPersist(column);
      return { columns: updatedColumns };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Update an existing column
   * @param {string} columnId - Column ID
   * @param {Object} updates - Partial column updates
   */
  updateColumn: (columnId, updates) => {
    set((state) => {
      const updatedColumns = state.columns.map((c) =>
        c.id === columnId ? { ...c, ...updates, updatedAt: Date.now() } : c
      );
      const updatedColumn = updatedColumns.find((c) => c.id === columnId);
      if (updatedColumn) {
        debouncedPersist(updatedColumn);
      }
      return { columns: updatedColumns };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Delete a column
   * @param {string} columnId - Column ID to delete
   */
  deleteColumn: async (columnId) => {
    try {
      await storageService.delete('columns', columnId);
      set((state) => ({
        columns: state.columns.filter((c) => c.id !== columnId),
      }));
    } catch (error) {
      console.error('Error deleting column:', error);
      set({ error: error.message });
    }
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

  // PUBLIC_INTERFACE
  /**
   * Get columns for a specific board from current state
   * @param {string} boardId - Board ID
   * @returns {Array} Array of columns
   */
  getColumnsByBoard: (boardId) => {
    return get().columns
      .filter((c) => c.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  },
}));

// Selectors
export const selectColumns = (state) => state.columns;
export const selectColumnsByBoard = (boardId) => (state) =>
  state.columns
    .filter((c) => c.boardId === boardId)
    .sort((a, b) => a.position - b.position);
export const selectLoading = (state) => state.loading;
export const selectError = (state) => state.error;

export default useColumnStore;
