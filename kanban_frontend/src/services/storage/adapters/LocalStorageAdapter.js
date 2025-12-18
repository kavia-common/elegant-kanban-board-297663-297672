/**
 * LocalStorageAdapter - LocalStorage implementation of storage adapter
 * Provides simple key-value storage as fallback when IndexedDB unavailable
 */
class LocalStorageAdapter {
  constructor(prefix = 'kanban') {
    this.prefix = prefix;
    this.initialized = false;
  }

  // PUBLIC_INTERFACE
  /**
   * Initialize localStorage adapter
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    try {
      // Test localStorage availability
      const testKey = `${this.prefix}__test__`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.initialized = true;
      console.log('LocalStorage adapter initialized successfully');
      return true;
    } catch (err) {
      console.error('Error initializing LocalStorage:', err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Save an item to localStorage
   * @param {string} storeName - The store name
   * @param {Object} data - Data to save (must include id)
   * @returns {Promise<boolean>} Success status
   */
  async save(storeName, data) {
    try {
      const store = await this.getStoreData(storeName);
      store[data.id] = data;
      localStorage.setItem(this.getKey(storeName), JSON.stringify(store));
      return true;
    } catch (err) {
      console.error(`Error saving to localStorage store '${storeName}':`, err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get an item from localStorage
   * @param {string} storeName - The store name
   * @param {string} id - The item id
   * @returns {Promise<Object|null>} Retrieved data or null
   */
  async get(storeName, id) {
    try {
      const store = await this.getStoreData(storeName);
      return store[id] || null;
    } catch (err) {
      console.error(`Error getting from localStorage store '${storeName}':`, err);
      return null;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get all items from a store
   * @param {string} storeName - The store name
   * @param {Object} filter - Optional filter (applied in-memory)
   * @returns {Promise<Array>} Array of items
   */
  async getAll(storeName, filter = null) {
    try {
      const store = await this.getStoreData(storeName);
      let items = Object.values(store);
      
      if (filter) {
        items = items.filter(item => {
          return Object.entries(filter).every(([key, value]) => item[key] === value);
        });
      }
      
      return items;
    } catch (err) {
      console.error(`Error getting all from localStorage store '${storeName}':`, err);
      return [];
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete an item from localStorage
   * @param {string} storeName - The store name
   * @param {string} id - The item id
   * @returns {Promise<boolean>} Success status
   */
  async delete(storeName, id) {
    try {
      const store = await this.getStoreData(storeName);
      delete store[id];
      localStorage.setItem(this.getKey(storeName), JSON.stringify(store));
      return true;
    } catch (err) {
      console.error(`Error deleting from localStorage store '${storeName}':`, err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Bulk save items to localStorage
   * @param {string} storeName - The store name
   * @param {Array} items - Array of items to save
   * @returns {Promise<boolean>} Success status
   */
  async bulkSave(storeName, items) {
    try {
      const store = await this.getStoreData(storeName);
      items.forEach(item => {
        store[item.id] = item;
      });
      localStorage.setItem(this.getKey(storeName), JSON.stringify(store));
      return true;
    } catch (err) {
      console.error(`Error bulk saving to localStorage store '${storeName}':`, err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Clear all items from a store
   * @param {string} storeName - The store name
   * @returns {Promise<boolean>} Success status
   */
  async clear(storeName) {
    try {
      localStorage.removeItem(this.getKey(storeName));
      return true;
    } catch (err) {
      console.error(`Error clearing localStorage store '${storeName}':`, err);
      return false;
    }
  }

  /**
   * Get the storage key for a store
   * @private
   */
  getKey(storeName) {
    return `${this.prefix}__${storeName}`;
  }

  /**
   * Get all data from a store
   * @private
   */
  async getStoreData(storeName) {
    try {
      const data = localStorage.getItem(this.getKey(storeName));
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(`Error parsing store data for '${storeName}':`, err);
      return {};
    }
  }
}

export default LocalStorageAdapter;
