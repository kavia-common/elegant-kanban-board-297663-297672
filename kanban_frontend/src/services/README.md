# Services Layer Documentation

This directory contains the service layer abstractions for the Kanban board application. The services provide reusable business logic and utilities that can be consumed by components and state management.

## Directory Structure

```
services/
├── storage/              # Storage abstraction layer
│   ├── adapters/        # Storage adapter implementations
│   │   ├── IndexedDBAdapter.js    # IndexedDB implementation
│   │   └── LocalStorageAdapter.js # LocalStorage fallback
│   ├── StorageService.js          # Main storage service
│   ├── schema.js                  # Database schema definition
│   └── index.js                   # Storage exports
├── dragDrop/            # Drag and drop utilities
│   ├── DragDropService.js         # Drag/drop state management
│   ├── dragTypes.js               # Drag type constants
│   ├── dragUtils.js               # Utility functions
│   └── index.js                   # Drag/drop exports
├── search/              # Search functionality
│   ├── SearchService.js           # Search operations
│   └── index.js                   # Search exports
├── filter/              # Filter functionality
│   ├── FilterService.js           # Filter operations
│   └── index.js                   # Filter exports
├── export/              # Export functionality
│   ├── ExportService.js           # Export to JSON/CSV/Markdown
│   └── index.js                   # Export exports
├── import/              # Import functionality
│   ├── ImportService.js           # Import from JSON/CSV
│   └── index.js                   # Import exports
└── index.js             # Main services export file
```

## Services Overview

### 1. Storage Service

**Purpose:** Provides unified storage abstraction with pluggable adapters (IndexedDB with LocalStorage fallback).

**Key Features:**
- Adapter pattern for flexible storage backends
- IndexedDB for high-performance client-side storage
- LocalStorage adapter as fallback
- Async/await API
- Schema-based initialization
- CRUD operations with filtering support

**Usage:**
```javascript
import { getStorageService } from '../services/storage';

const storage = getStorageService();
await storage.init();

// Save data
await storage.save('boards', { id: '1', name: 'My Board' });

// Get data
const board = await storage.get('boards', '1');

// Get all with filter
const cards = await storage.getAll('cards', { columnId: 'col-1' });
```

**Adapters:**
- `IndexedDBAdapter`: Uses Dexie.js for IndexedDB operations
- `LocalStorageAdapter`: JSON-based storage in localStorage

### 2. Drag and Drop Service

**Purpose:** Centralized drag and drop state management and utilities.

**Key Features:**
- Drag state tracking
- Reordering within containers
- Moving items between containers
- Position updates
- Event subscription system

**Usage:**
```javascript
import { getDragDropService, dragUtils } from '../services/dragDrop';

const dragDropService = getDragDropService();

// Start drag
dragDropService.startDrag(item, 'CARD', 'column-1');

// Reorder items
const reordered = dragDropService.reorderItems(items, 0, 2);

// Move between containers
const { source, destination } = dragDropService.moveItem(
  sourceItems, 
  destItems, 
  0, 
  1
);
```

**Constants:**
- `DragTypes.CARD`: Card drag type
- `DragTypes.COLUMN`: Column drag type
- `DragTypes.BOARD`: Board drag type

### 3. Search Service

**Purpose:** Flexible search across cards, boards, and other entities.

**Key Features:**
- Text search with relevance scoring
- Multi-field search
- Advanced query parsing (tag:, priority:, due:)
- Search history
- Highlight matching text
- Case-sensitive/insensitive options

**Usage:**
```javascript
import { getSearchService } from '../services/search';

const searchService = getSearchService();

// Basic search
const results = searchService.searchCards(cards, 'bug fix');

// Advanced search with operators
const results = searchService.advancedSearch(
  cards, 
  'tag:urgent priority:high due:today'
);

// Get suggestions
const suggestions = searchService.getSuggestions('bu');
```

### 4. Filter Service

**Purpose:** Filter and sort cards, boards, and columns.

**Key Features:**
- Multi-criteria filtering
- Sort by any field
- Group items by field
- Filter presets (myCards, highPriority, dueSoon, etc.)
- Active filter state management

**Usage:**
```javascript
import { getFilterService } from '../services/filter';

const filterService = getFilterService();

// Filter cards
const filtered = filterService.filterCards(cards, {
  priority: ['high', 'urgent'],
  dueDate: 'week',
  showArchived: false
});

// Sort items
const sorted = filterService.sortItems(cards, 'dueDate', 'asc');

// Use presets
const presets = filterService.getFilterPresets();
const filtered = filterService.filterCards(cards, presets.dueToday);
```

### 5. Export Service

**Purpose:** Export board data to various formats.

**Key Features:**
- Export to JSON (full board data)
- Export to CSV (cards)
- Export to Markdown (formatted board view)
- Download as file

**Usage:**
```javascript
import { getExportService } from '../services/export';

const exportService = getExportService();

// Export as JSON
exportService.exportBoardAsJSON(board, columns, cards);

// Export as CSV
exportService.exportCardsAsCSV(cards, columns, 'My Board');

// Export as Markdown
exportService.exportBoardAsMarkdown(board, columns, cards);
```

### 6. Import Service

**Purpose:** Import board data from JSON and CSV files.

**Key Features:**
- Import from JSON (full board restore)
- Import cards from CSV
- Data validation
- Merge with existing data
- ID remapping for conflicts

**Usage:**
```javascript
import { getImportService } from '../services/import';

const importService = getImportService();

// Import from file
const data = await importService.importFromFile(file);

// Validate imported data
const validation = importService.validateImportData(data);

// Merge with existing data
const merged = importService.mergeData(
  importedData, 
  existingData, 
  { generateNewIds: true }
);
```

## Integration with Existing Code

The services layer has been integrated with the existing codebase:

1. **`src/utils/storage.js`**: Refactored to use `StorageService` under the hood while maintaining backward compatibility with the existing API.

2. **Singleton Pattern**: All services use singleton instances accessed via `getServiceName()` functions for consistent state across the application.

3. **No UI Dependencies**: Services are pure business logic with no React or UI dependencies, making them easy to test and reuse.

## Testing

All services are designed to be unit-test friendly:

- Pure functions for utilities
- Dependency injection for adapters
- Reset functions for test isolation
- No hard dependencies on browser APIs (can be mocked)

Example test structure:
```javascript
import { getStorageService, resetStorageService } from './services/storage';

describe('StorageService', () => {
  beforeEach(() => {
    resetStorageService();
  });

  it('should save and retrieve data', async () => {
    const storage = getStorageService(true); // Use LocalStorage for testing
    await storage.init();
    await storage.save('test', { id: '1', name: 'Test' });
    const result = await storage.get('test', '1');
    expect(result.name).toBe('Test');
  });
});
```

## Next Steps

These services are ready for integration with the UI layer:

1. Use `StorageService` in Redux/Zustand middleware for persistence
2. Integrate `DragDropService` with react-beautiful-dnd or react-dnd
3. Connect `SearchService` to search input components
4. Wire `FilterService` to filter UI controls
5. Add export/import buttons that use the Export/Import services

## API Documentation

All public interfaces are documented with JSDoc comments. Key conventions:

- All public methods are marked with `// PUBLIC_INTERFACE` comment
- All functions include parameter and return type documentation
- Error handling is consistent across all services
- All async operations return Promises

## Performance Considerations

- IndexedDB operations are async and non-blocking
- Search uses scoring for relevance ranking
- Filters are applied in-memory (consider virtualization for large datasets)
- Services use singleton pattern to avoid multiple instances
- Event listeners can be unsubscribed to prevent memory leaks
