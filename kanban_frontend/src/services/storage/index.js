import StorageService from './StorageService';
import IndexedDBAdapter from './adapters/IndexedDBAdapter';
import LocalStorageAdapter from './adapters/LocalStorageAdapter';
import storageSchema from './schema';

/**
 * Create and configure the default storage service instance
 * Uses IndexedDB with LocalStorage fallback
 */
let storageServiceInstance = null;

// PUBLIC_INTERFACE
/**
 * Get or create the storage service singleton
 * @param {boolean} useLocalStorage - Force LocalStorage adapter (for testing)
 * @returns {StorageService} Storage service instance
 */
export const getStorageService = (useLocalStorage = false) => {
  if (storageServiceInstance) {
    return storageServiceInstance;
  }

  // Determine which adapter to use
  let adapter;
  if (useLocalStorage || !window.indexedDB) {
    console.log('Using LocalStorage adapter');
    adapter = new LocalStorageAdapter('kanban');
  } else {
    console.log('Using IndexedDB adapter');
    adapter = new IndexedDBAdapter(storageSchema);
  }

  storageServiceInstance = new StorageService(adapter);
  return storageServiceInstance;
};

// PUBLIC_INTERFACE
/**
 * Reset the storage service instance (useful for testing)
 */
export const resetStorageService = () => {
  storageServiceInstance = null;
};

// Export classes for direct use if needed
export { StorageService, IndexedDBAdapter, LocalStorageAdapter, storageSchema };

// Default export
export default getStorageService;
