/**
 * Storage utility module - Backward compatibility wrapper
 * This module provides backward compatibility with the old storage API
 * while using the new StorageService abstraction under the hood
 */
import getStorageService from '../services/storage';

// Get storage service instance
const storageService = getStorageService();

// PUBLIC_INTERFACE
/**
 * Initialize IndexedDB connection
 * @returns {Promise<boolean>} Success status
 */
export const initIndexedDB = async () => {
  return await storageService.init();
};

// PUBLIC_INTERFACE
/**
 * Save data to IndexedDB
 * @param {string} storeName - The object store name
 * @param {Object} data - Data to save
 * @returns {Promise<boolean>} Success status
 */
export const saveToIndexedDB = async (storeName, data) => {
  return await storageService.save(storeName, data);
};

// PUBLIC_INTERFACE
/**
 * Load data from IndexedDB
 * @param {string} storeName - The object store name
 * @param {string} key - The key to retrieve
 * @returns {Promise<Object|null>} Retrieved data or null
 */
export const loadFromIndexedDB = async (storeName, key) => {
  return await storageService.get(storeName, key);
};

// PUBLIC_INTERFACE
/**
 * Load all data from a store
 * @param {string} storeName - The object store name
 * @param {Object} filter - Optional filter object
 * @returns {Promise<Array>} Array of items
 */
export const loadAllFromIndexedDB = async (storeName, filter = null) => {
  return await storageService.getAll(storeName, filter);
};

// PUBLIC_INTERFACE
/**
 * Delete data from IndexedDB
 * @param {string} storeName - The object store name
 * @param {string} id - The key to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromIndexedDB = async (storeName, id) => {
  return await storageService.delete(storeName, id);
};

// PUBLIC_INTERFACE
/**
 * Bulk save to IndexedDB
 * @param {string} storeName - The object store name
 * @param {Array} items - Array of items to save
 * @returns {Promise<boolean>} Success status
 */
export const bulkSaveToIndexedDB = async (storeName, items) => {
  return await storageService.bulkSave(storeName, items);
};

// PUBLIC_INTERFACE
/**
 * Clear all data from a store
 * @param {string} storeName - The object store name
 * @returns {Promise<boolean>} Success status
 */
export const clearStoreInIndexedDB = async (storeName) => {
  return await storageService.clear(storeName);
};

// PUBLIC_INTERFACE
/**
 * Load application state from localStorage (fallback)
 * @returns {Object|null} Parsed state object or null if not found
 */
export const loadAppState = () => {
  try {
    const serializedState = localStorage.getItem('kanban-app-state');
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading app state:', err);
    return null;
  }
};

// PUBLIC_INTERFACE
/**
 * Save application state to localStorage (fallback)
 * @param {Object} state - The state object to save
 * @returns {boolean} Success status
 */
export const saveAppState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('kanban-app-state', serializedState);
    return true;
  } catch (err) {
    console.error('Error saving app state:', err);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Clear all persisted application state
 */
export const clearAppState = () => {
  try {
    localStorage.removeItem('kanban-app-state');
  } catch (err) {
    console.error('Error clearing app state:', err);
  }
};

// Export the storage service instance for advanced usage
export { storageService };
