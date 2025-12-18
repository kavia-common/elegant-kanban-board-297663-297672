import { create } from 'zustand';

// PUBLIC_INTERFACE
/**
 * UI store using Zustand for managing application UI state
 * Handles search, theme, modals, and other UI-related state
 */
const useUIStore = create((set, get) => ({
  // State
  searchQuery: '',
  theme: localStorage.getItem('theme') || 'light',
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,

  // PUBLIC_INTERFACE
  /**
   * Set search query
   * @param {string} query - Search query string
   */
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // PUBLIC_INTERFACE
  /**
   * Clear search query
   */
  clearSearchQuery: () => {
    set({ searchQuery: '' });
  },

  // PUBLIC_INTERFACE
  /**
   * Toggle theme between light and dark
   */
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    });
  },

  // PUBLIC_INTERFACE
  /**
   * Set theme explicitly
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  // PUBLIC_INTERFACE
  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  // PUBLIC_INTERFACE
  /**
   * Set sidebar collapsed state
   * @param {boolean} collapsed - Collapsed state
   */
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  // PUBLIC_INTERFACE
  /**
   * Open a modal
   * @param {string} modalName - Name/type of modal
   * @param {Object} data - Optional data for the modal
   */
  openModal: (modalName, data = null) => {
    set({ activeModal: modalName, modalData: data });
  },

  // PUBLIC_INTERFACE
  /**
   * Close the active modal
   */
  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },
}));

// Selectors
export const selectSearchQuery = (state) => state.searchQuery;
export const selectTheme = (state) => state.theme;
export const selectSidebarCollapsed = (state) => state.sidebarCollapsed;
export const selectActiveModal = (state) => state.activeModal;
export const selectModalData = (state) => state.modalData;

export default useUIStore;
