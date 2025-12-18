/**
 * StorageService - Main storage abstraction layer
 * Provides a unified interface for data persistence with pluggable adapters
 */
class StorageService {
  constructor(adapter) {
    this.adapter = adapter;
    this.initialized = false;
  }

  // PUBLIC_INTERFACE
  /**
   * Initialize the storage service
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (this.initialized) return true;
    this.initialized = await this.adapter.init();
    return this.initialized;
  }

  // PUBLIC_INTERFACE
  /**
   * Save an item to storage
   * @param {string} storeName - The store/collection name
   * @param {Object} data - Data to save (must include id)
   * @returns {Promise<boolean>} Success status
   */
  async save(storeName, data) {
    await this.ensureInitialized();
    return this.adapter.save(storeName, data);
  }

  // PUBLIC_INTERFACE
  /**
   * Get an item from storage
   * @param {string} storeName - The store/collection name
   * @param {string} id - The item id
   * @returns {Promise<Object|null>} Retrieved data or null
   */
  async get(storeName, id) {
    await this.ensureInitialized();
    return this.adapter.get(storeName, id);
  }

  // PUBLIC_INTERFACE
  /**
   * Get all items from a store
   * @param {string} storeName - The store/collection name
   * @param {Object} filter - Optional filter criteria
   * @returns {Promise<Array>} Array of items
   */
  async getAll(storeName, filter = null) {
    await this.ensureInitialized();
    return this.adapter.getAll(storeName, filter);
  }

  // PUBLIC_INTERFACE
  /**
   * Delete an item from storage
   * @param {string} storeName - The store/collection name
   * @param {string} id - The item id
   * @returns {Promise<boolean>} Success status
   */
  async delete(storeName, id) {
    await this.ensureInitialized();
    return this.adapter.delete(storeName, id);
  }

  // PUBLIC_INTERFACE
  /**
   * Bulk save items to storage
   * @param {string} storeName - The store/collection name
   * @param {Array} items - Array of items to save
   * @returns {Promise<boolean>} Success status
   */
  async bulkSave(storeName, items) {
    await this.ensureInitialized();
    return this.adapter.bulkSave(storeName, items);
  }

  // PUBLIC_INTERFACE
  /**
   * Clear all items from a store
   * @param {string} storeName - The store/collection name
   * @returns {Promise<boolean>} Success status
   */
  async clear(storeName) {
    await this.ensureInitialized();
    return this.adapter.clear(storeName);
  }

  // PUBLIC_INTERFACE
  /**
   * Query items with advanced filtering
   * @param {string} storeName - The store/collection name
   * @param {Function} predicate - Filter function
   * @returns {Promise<Array>} Filtered items
   */
  async query(storeName, predicate) {
    await this.ensureInitialized();
    const items = await this.adapter.getAll(storeName);
    return items.filter(predicate);
  }

  /**
   * Ensure storage is initialized
   * @private
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }
}

export default StorageService;
