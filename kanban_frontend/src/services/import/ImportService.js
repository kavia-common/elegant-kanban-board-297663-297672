/**
 * ImportService - Handles importing board data from various formats
 * Supports JSON and CSV formats with validation
 */
class ImportService {
  // PUBLIC_INTERFACE
  /**
   * Import board data from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {Object} Imported data with board, columns, and cards
   * @throws {Error} If JSON is invalid or structure is incorrect
   */
  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate structure
      this.validateJSONStructure(data);

      return {
        board: data.board,
        columns: data.columns || [],
        cards: data.cards || [],
        metadata: {
          version: data.version,
          exportedAt: data.exportedAt,
          importedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      throw new Error(`Failed to import JSON: ${err.message}`);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Import cards from CSV
   * @param {string} csvString - CSV string to import
   * @param {Array} existingColumns - Existing columns to map to
   * @returns {Array} Imported cards
   * @throws {Error} If CSV is invalid
   */
  importFromCSV(csvString, existingColumns = []) {
    try {
      const lines = csvString.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV must have header and at least one data row');
      }

      const headers = this.parseCSVLine(lines[0]);
      const cards = [];

      // Create column name to ID map
      const columnMap = existingColumns.reduce((map, col) => {
        map[col.name.toLowerCase()] = col.id;
        return map;
      }, {});

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const card = this.mapCSVRowToCard(headers, values, columnMap);
        if (card) {
          cards.push(card);
        }
      }

      return cards;
    } catch (err) {
      throw new Error(`Failed to import CSV: ${err.message}`);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Read file as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File content as string
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Import board from file
   * @param {File} file - File to import
   * @returns {Promise<Object>} Imported data
   */
  async importFromFile(file) {
    const content = await this.readFile(file);
    const extension = file.name.split('.').pop().toLowerCase();

    switch (extension) {
      case 'json':
        return this.importFromJSON(content);
      case 'csv':
        return { cards: this.importFromCSV(content) };
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Validate imported data
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result with { valid, errors }
   */
  validateImportData(data) {
    const errors = [];

    if (data.board) {
      if (!data.board.name || data.board.name.trim() === '') {
        errors.push('Board name is required');
      }
    }

    if (data.columns) {
      data.columns.forEach((col, index) => {
        if (!col.name || col.name.trim() === '') {
          errors.push(`Column ${index + 1} is missing a name`);
        }
      });
    }

    if (data.cards) {
      data.cards.forEach((card, index) => {
        if (!card.title || card.title.trim() === '') {
          errors.push(`Card ${index + 1} is missing a title`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Merge imported data with existing data
   * @param {Object} importedData - Imported data
   * @param {Object} existingData - Existing data
   * @param {Object} options - Merge options
   * @returns {Object} Merged data
   */
  mergeData(importedData, existingData, options = {}) {
    const {
      replaceExisting = false,
      generateNewIds = true
    } = options;

    const merged = {
      board: replaceExisting ? importedData.board : existingData.board,
      columns: replaceExisting ? importedData.columns : [...existingData.columns],
      cards: replaceExisting ? importedData.cards : [...existingData.cards]
    };

    if (!replaceExisting) {
      // Append imported items
      if (generateNewIds) {
        const idMap = this.generateNewIds(importedData);
        merged.columns.push(...this.remapIds(importedData.columns, idMap));
        merged.cards.push(...this.remapIds(importedData.cards, idMap));
      } else {
        merged.columns.push(...importedData.columns);
        merged.cards.push(...importedData.cards);
      }
    }

    return merged;
  }

  /**
   * Validate JSON structure
   * @private
   */
  validateJSONStructure(data) {
    if (!data.version) {
      throw new Error('Missing version field');
    }

    if (!data.board || typeof data.board !== 'object') {
      throw new Error('Invalid or missing board data');
    }

    if (!data.board.name) {
      throw new Error('Board name is required');
    }

    if (!Array.isArray(data.columns)) {
      throw new Error('Columns must be an array');
    }

    if (!Array.isArray(data.cards)) {
      throw new Error('Cards must be an array');
    }
  }

  /**
   * Parse CSV line handling quoted fields
   * @private
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Map CSV row to card object
   * @private
   */
  mapCSVRowToCard(headers, values, columnMap) {
    const card = {
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    headers.forEach((header, index) => {
      const value = values[index] || '';
      const headerLower = header.toLowerCase();

      switch (headerLower) {
        case 'title':
          card.title = value;
          break;
        case 'description':
          card.description = value;
          break;
        case 'column':
          card.columnId = columnMap[value.toLowerCase()] || null;
          break;
        case 'priority':
          card.priority = value;
          break;
        case 'due date':
          card.dueDate = value;
          break;
        case 'labels':
          card.labels = value ? value.split(',').map(l => ({ name: l.trim() })) : [];
          break;
        case 'tags':
          card.tags = value ? value.split(',').map(t => t.trim()) : [];
          break;
      }
    });

    return card.title ? card : null;
  }

  /**
   * Generate new IDs for imported items
   * @private
   */
  generateNewIds(data) {
    const idMap = {};

    // Map column IDs
    if (data.columns) {
      data.columns.forEach(col => {
        idMap[col.id] = this.generateId();
      });
    }

    // Map card IDs
    if (data.cards) {
      data.cards.forEach(card => {
        idMap[card.id] = this.generateId();
      });
    }

    return idMap;
  }

  /**
   * Remap item IDs using ID map
   * @private
   */
  remapIds(items, idMap) {
    return items.map(item => {
      const newItem = { ...item };
      if (idMap[item.id]) {
        newItem.id = idMap[item.id];
      }
      if (item.columnId && idMap[item.columnId]) {
        newItem.columnId = idMap[item.columnId];
      }
      return newItem;
    });
  }

  /**
   * Generate unique ID
   * @private
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let importServiceInstance = null;

// PUBLIC_INTERFACE
/**
 * Get the ImportService singleton instance
 * @returns {ImportService} Service instance
 */
export const getImportService = () => {
  if (!importServiceInstance) {
    importServiceInstance = new ImportService();
  }
  return importServiceInstance;
};

export default ImportService;
