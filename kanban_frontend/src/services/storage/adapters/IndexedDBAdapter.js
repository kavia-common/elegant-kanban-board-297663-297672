import Dexie from 'dexie';

/**
 * IndexedDBAdapter - IndexedDB implementation of storage adapter
 * Provides high-performance client-side storage with indexing
 */
class IndexedDBAdapter {
  constructor(schema) {
    this.db = null;
    this.schema = schema;
  }

  // PUBLIC_INTERFACE
  /**
   * Initialize IndexedDB connection
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    try {
      this.db = new Dexie(this.schema.name);
      this.db.version(this.schema.version).stores(this.schema.stores);
      await this.db.open();
      console.log(`IndexedDB '${this.schema.name}' initialized successfully`);
      return true;
    } catch (err) {
      console.error('Error initializing IndexedDB:', err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Save an item to IndexedDB
   * @param {string} storeName - The object store name
   * @param {Object} data - Data to save (must include id)
   * @returns {Promise<boolean>} Success status
   */
  async save(storeName, data) {
    try {
      await this.db[storeName].put(data);
      return true;
    } catch (err) {
      console.error(`Error saving to IndexedDB store '${storeName}':`, err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get an item from IndexedDB
   * @param {string} storeName - The object store name
   * @param {string} id - The item id
   * @returns {Promise<Object|null>} Retrieved data or null
   */
  async get(storeName, id) {
    try {
      return await this.db[storeName].get(id);
    } catch (err) {
      console.error(`Error getting from IndexedDB store '${storeName}':`, err);
      return null;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get all items from a store
   * @param {string} storeName - The object store name
   * @param {Object} filter - Optional filter object for indexed queries
   * @returns {Promise<Array>} Array of items
   */
  async getAll(storeName, filter = null) {
    try {
      if (filter) {
        const collection = this.db[storeName].where(filter);
        return await collection.toArray();
      }
      return await this.db[storeName].toArray();
    } catch (err) {
      console.error(`Error getting all from IndexedDB store '${storeName}':`, err);
      return [];
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete an item from IndexedDB
   * @param {string} storeName - The object store name
   * @param {string} id - The item id
   * @returns {Promise<boolean>} Success status
   */
  async delete(storeName, id) {
    try {
      await this.db[storeName].delete(id);
      return true;
    } catch (err) {
      console.error(`Error deleting from IndexedDB store '${storeName}':`, err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Bulk save items to IndexedDB
   * @param {string} storeName - The object store name
   * @param {Array} items - Array of items to save
   * @returns {Promise<boolean>} Success status
   */
  async bulkSave(storeName, items) {
    try {
      await this.db[storeName].bulkPut(items);
      return true;
    } catch (err) {
      console.error(`Error bulk saving to IndexedDB store '${storeName}':`, err);
      return false;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Clear all items from a store
   * @param {string} storeName - The object store name
   * @returns {Promise<boolean>} Success status
   */
  async clear(storeName) {
    try {
      await this.db[storeName].clear();
      return true;
    } catch (err) {
      console.error(`Error clearing IndexedDB store '${storeName}':`, err);
      return false;
    }
  }
}

export default IndexedDBAdapter;
