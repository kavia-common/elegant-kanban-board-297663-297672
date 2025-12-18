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

const debouncedPersist = createDebouncedPersist('cards', 300);

// PUBLIC_INTERFACE
/**
 * Card store using Zustand with debounced persistence
 * Manages card state with automatic persistence to IndexedDB
 */
const useCardStore = create((set, get) => ({
  // State
  cards: [],
  loading: false,
  error: null,
  initialized: false,

  // PUBLIC_INTERFACE
  /**
   * Initialize the card store by loading data from storage
   * @returns {Promise<void>}
   */
  init: async () => {
    if (get().initialized) return;
    
    set({ loading: true, error: null });
    try {
      await storageService.init();
      const cards = await storageService.getAll('cards');
      set({ 
        cards: cards || [], 
        initialized: true,
        loading: false 
      });
    } catch (error) {
      console.error('Error initializing card store:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Load cards for specific columns
   * @param {Array<string>} columnIds - Array of column IDs
   */
  loadCards: async (columnIds) => {
    set({ loading: true, error: null });
    try {
      await storageService.init();
      const allCards = await storageService.getAll('cards');
      const filteredCards = allCards.filter((card) =>
        columnIds.includes(card.columnId)
      );
      set({ cards: filteredCards, loading: false });
    } catch (error) {
      console.error('Error loading cards:', error);
      set({ error: error.message, loading: false });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Add a new card
   * @param {Object} card - Card object with all properties
   */
  addCard: (card) => {
    set((state) => {
      const updatedCards = [...state.cards, card];
      debouncedPersist(card);
      return { cards: updatedCards };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Update an existing card
   * @param {string} cardId - Card ID
   * @param {Object} updates - Partial card updates
   */
  updateCard: (cardId, updates) => {
    set((state) => {
      const updatedCards = state.cards.map((c) =>
        c.id === cardId ? { ...c, ...updates, updatedAt: Date.now() } : c
      );
      const updatedCard = updatedCards.find((c) => c.id === cardId);
      if (updatedCard) {
        debouncedPersist(updatedCard);
      }
      return { cards: updatedCards };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Batch update multiple cards (for drag and drop)
   * @param {Array<Object>} cardUpdates - Array of {id, updates} objects
   */
  batchUpdateCards: (cardUpdates) => {
    set((state) => {
      const updatedCards = state.cards.map((card) => {
        const update = cardUpdates.find((u) => u.id === card.id);
        if (update) {
          const updatedCard = { ...card, ...update.updates, updatedAt: Date.now() };
          debouncedPersist(updatedCard);
          return updatedCard;
        }
        return card;
      });
      return { cards: updatedCards };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Delete a card
   * @param {string} cardId - Card ID to delete
   */
  deleteCard: async (cardId) => {
    try {
      await storageService.delete('cards', cardId);
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== cardId),
      }));
    } catch (error) {
      console.error('Error deleting card:', error);
      set({ error: error.message });
    }
  },

  // PUBLIC_INTERFACE
  /**
   * Move a card to a different column and/or position
   * @param {string} cardId - Card ID
   * @param {string} targetColumnId - Target column ID
   * @param {number} position - New position
   */
  moveCard: (cardId, targetColumnId, position) => {
    get().updateCard(cardId, { columnId: targetColumnId, position });
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
   * Get cards for a specific column from current state
   * @param {string} columnId - Column ID
   * @returns {Array} Array of cards
   */
  getCardsByColumn: (columnId) => {
    return get().cards
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  },
}));

// Selectors
export const selectCards = (state) => state.cards;
export const selectCardsByColumn = (columnId) => (state) =>
  state.cards
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.position - b.position);
export const selectLoading = (state) => state.loading;
export const selectError = (state) => state.error;

export default useCardStore;
