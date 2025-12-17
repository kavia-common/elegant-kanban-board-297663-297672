import Dexie from 'dexie';

// IndexedDB database instance
let db = null;

// PUBLIC_INTERFACE
/**
 * Initialize IndexedDB connection
 * @returns {Promise<boolean>} Success status
 */
export const initIndexedDB = async () => {
  try {
    db = new Dexie('kanban-app-db');
    
    db.version(1).stores({
      boards: 'id, createdAt, starred, archived',
      columns: 'id, boardId, position',
      cards: 'id, columnId, position, dueDate, priority',
      labels: 'id, boardId',
      settings: 'key'
    });

    await db.open();
    console.log('IndexedDB initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing IndexedDB:', err);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Save data to IndexedDB
 * @param {string} storeName - The object store name
 * @param {Object} data - Data to save
 * @returns {Promise<boolean>} Success status
 */
export const saveToIndexedDB = async (storeName, data) => {
  try {
    if (!db) await initIndexedDB();
    await db[storeName].put(data);
    return true;
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Load data from IndexedDB
 * @param {string} storeName - The object store name
 * @param {string} key - The key to retrieve
 * @returns {Promise<Object|null>} Retrieved data or null
 */
export const loadFromIndexedDB = async (storeName, key) => {
  try {
    if (!db) await initIndexedDB();
    return await db[storeName].get(key);
  } catch (err) {
    console.error('Error loading from IndexedDB:', err);
    return null;
  }
};

// PUBLIC_INTERFACE
/**
 * Load all data from a store
 * @param {string} storeName - The object store name
 * @param {Object} filter - Optional filter object
 * @returns {Promise<Array>} Array of items
 */
export const loadAllFromIndexedDB = async (storeName, filter = null) => {
  try {
    if (!db) await initIndexedDB();
    
    if (filter) {
      const collection = db[storeName].where(filter);
      return await collection.toArray();
    }
    
    return await db[storeName].toArray();
  } catch (err) {
    console.error('Error loading all from IndexedDB:', err);
    return [];
  }
};

// PUBLIC_INTERFACE
/**
 * Delete data from IndexedDB
 * @param {string} storeName - The object store name
 * @param {string} id - The key to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromIndexedDB = async (storeName, id) => {
  try {
    if (!db) await initIndexedDB();
    await db[storeName].delete(id);
    return true;
  } catch (err) {
    console.error('Error deleting from IndexedDB:', err);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Bulk save to IndexedDB
 * @param {string} storeName - The object store name
 * @param {Array} items - Array of items to save
 * @returns {Promise<boolean>} Success status
 */
export const bulkSaveToIndexedDB = async (storeName, items) => {
  try {
    if (!db) await initIndexedDB();
    await db[storeName].bulkPut(items);
    return true;
  } catch (err) {
    console.error('Error bulk saving to IndexedDB:', err);
    return false;
  }
};

// PUBLIC_INTERFACE
/**
 * Clear all data from a store
 * @param {string} storeName - The object store name
 * @returns {Promise<boolean>} Success status
 */
export const clearStoreInIndexedDB = async (storeName) => {
  try {
    if (!db) await initIndexedDB();
    await db[storeName].clear();
    return true;
  } catch (err) {
    console.error('Error clearing store in IndexedDB:', err);
    return false;
  }
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
