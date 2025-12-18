// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IndexedDB for testing
class IDBFactoryMock {
  open() {
    return {
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      result: null,
    };
  }
  deleteDatabase() {
    return {
      onsuccess: null,
      onerror: null,
    };
  }
}

class IDBDatabaseMock {
  createObjectStore() {
    return {
      createIndex: () => {},
    };
  }
  transaction() {
    return {
      objectStore: () => ({
        add: () => ({ onsuccess: null, onerror: null }),
        put: () => ({ onsuccess: null, onerror: null }),
        get: () => ({ onsuccess: null, onerror: null }),
        getAll: () => ({ onsuccess: null, onerror: null }),
        delete: () => ({ onsuccess: null, onerror: null }),
        clear: () => ({ onsuccess: null, onerror: null }),
      }),
    };
  }
}

// Set up IndexedDB mock
global.indexedDB = new IDBFactoryMock();
global.IDBDatabase = IDBDatabaseMock;
global.IDBObjectStore = class IDBObjectStoreMock {};
global.IDBTransaction = class IDBTransactionMock {};
global.IDBKeyRange = {
  only: () => {},
  lowerBound: () => {},
  upperBound: () => {},
  bound: () => {},
};

// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors for known issues during testing
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('IndexedDB API missing'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
