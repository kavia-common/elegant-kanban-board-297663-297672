import { create } from 'zustand';

// PUBLIC_INTERFACE
/**
 * Label store using Zustand for managing card labels
 * Supports color-coded labels for card categorization
 */
const useLabelStore = create((set, get) => ({
  // State
  labels: [
    { id: 'label-1', name: 'Bug', color: '#EF4444' },
    { id: 'label-2', name: 'Feature', color: '#10B981' },
    { id: 'label-3', name: 'Enhancement', color: '#3B82F6' },
    { id: 'label-4', name: 'Documentation', color: '#F59E0B' },
    { id: 'label-5', name: 'Urgent', color: '#DC2626' },
  ],

  // PUBLIC_INTERFACE
  /**
   * Add a new label
   * @param {Object} label - Label object {id, name, color}
   */
  addLabel: (label) => {
    set((state) => ({
      labels: [...state.labels, label],
    }));
  },

  // PUBLIC_INTERFACE
  /**
   * Update an existing label
   * @param {string} labelId - Label ID
   * @param {Object} updates - Partial label updates
   */
  updateLabel: (labelId, updates) => {
    set((state) => ({
      labels: state.labels.map((l) =>
        l.id === labelId ? { ...l, ...updates } : l
      ),
    }));
  },

  // PUBLIC_INTERFACE
  /**
   * Delete a label
   * @param {string} labelId - Label ID to delete
   */
  deleteLabel: (labelId) => {
    set((state) => ({
      labels: state.labels.filter((l) => l.id !== labelId),
    }));
  },

  // PUBLIC_INTERFACE
  /**
   * Get label by ID
   * @param {string} labelId - Label ID
   * @returns {Object|null} Label object or null
   */
  getLabelById: (labelId) => {
    return get().labels.find((l) => l.id === labelId) || null;
  },
}));

// Selectors
export const selectLabels = (state) => state.labels;
export const selectLabelById = (labelId) => (state) =>
  state.labels.find((l) => l.id === labelId);

export default useLabelStore;
