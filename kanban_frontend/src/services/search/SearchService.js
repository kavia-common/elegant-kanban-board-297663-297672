/**
 * SearchService - Handles search operations across different entity types
 * Provides flexible search with scoring and ranking
 */
class SearchService {
  constructor() {
    this.searchHistory = [];
    this.maxHistorySize = 10;
  }

  // PUBLIC_INTERFACE
  /**
   * Search cards by text
   * @param {Array} cards - Cards to search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Matching cards with relevance scores
   */
  searchCards(cards, query, options = {}) {
    const {
      fields = ['title', 'description', 'tags'],
      caseSensitive = false,
      exactMatch = false,
      minScore = 0.3
    } = options;

    if (!query || query.trim() === '') return cards;

    const normalizedQuery = caseSensitive ? query : query.toLowerCase();
    const results = [];

    cards.forEach(card => {
      const score = this.calculateRelevance(card, normalizedQuery, fields, caseSensitive, exactMatch);
      if (score >= minScore) {
        results.push({ ...card, _searchScore: score });
      }
    });

    // Sort by relevance score (descending)
    results.sort((a, b) => b._searchScore - a._searchScore);

    // Add to search history
    this.addToHistory(query);

    return results;
  }

  // PUBLIC_INTERFACE
  /**
   * Search boards by text
   * @param {Array} boards - Boards to search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Matching boards
   */
  searchBoards(boards, query, options = {}) {
    const {
      fields = ['name', 'description'],
      caseSensitive = false
    } = options;

    if (!query || query.trim() === '') return boards;

    const normalizedQuery = caseSensitive ? query : query.toLowerCase();

    return boards.filter(board => {
      return fields.some(field => {
        const value = board[field];
        if (!value) return false;
        const normalizedValue = caseSensitive ? value : value.toLowerCase();
        return normalizedValue.includes(normalizedQuery);
      });
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Search with advanced query parsing
   * @param {Array} items - Items to search
   * @param {string} query - Search query (supports operators like tag:, priority:)
   * @returns {Array} Matching items
   */
  advancedSearch(items, query) {
    if (!query || query.trim() === '') return items;

    // Parse query for special operators
    const operators = this.parseQuery(query);
    
    return items.filter(item => {
      // Text search
      if (operators.text) {
        const matchesText = this.matchesText(item, operators.text);
        if (!matchesText) return false;
      }

      // Tag filter
      if (operators.tags && operators.tags.length > 0) {
        const itemTags = item.tags || [];
        const hasTag = operators.tags.some(tag => 
          itemTags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
        if (!hasTag) return false;
      }

      // Priority filter
      if (operators.priority) {
        if (item.priority !== operators.priority) return false;
      }

      // Date filters
      if (operators.dueDate) {
        if (!this.matchesDateFilter(item.dueDate, operators.dueDate)) return false;
      }

      return true;
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Get search suggestions based on history
   * @param {string} partial - Partial query
   * @returns {Array} Suggested queries
   */
  getSuggestions(partial) {
    if (!partial) return this.searchHistory.slice(0, 5);

    const normalizedPartial = partial.toLowerCase();
    return this.searchHistory
      .filter(query => query.toLowerCase().startsWith(normalizedPartial))
      .slice(0, 5);
  }

  // PUBLIC_INTERFACE
  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
  }

  // PUBLIC_INTERFACE
  /**
   * Highlight matching text in string
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {Array} Array of {text, highlight} objects
   */
  highlightMatches(text, query) {
    if (!text || !query) return [{ text, highlight: false }];

    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const index = normalizedText.indexOf(normalizedQuery);

    if (index === -1) {
      return [{ text, highlight: false }];
    }

    return [
      { text: text.slice(0, index), highlight: false },
      { text: text.slice(index, index + query.length), highlight: true },
      { text: text.slice(index + query.length), highlight: false }
    ];
  }

  /**
   * Calculate relevance score for an item
   * @private
   */
  calculateRelevance(item, query, fields, caseSensitive, exactMatch) {
    let maxScore = 0;

    fields.forEach(field => {
      const value = item[field];
      if (!value) return;

      const normalizedValue = caseSensitive ? String(value) : String(value).toLowerCase();
      
      if (exactMatch) {
        if (normalizedValue === query) {
          maxScore = Math.max(maxScore, 1.0);
        }
      } else {
        // Calculate score based on match position and coverage
        const index = normalizedValue.indexOf(query);
        if (index !== -1) {
          const coverage = query.length / normalizedValue.length;
          const positionScore = 1 - (index / normalizedValue.length);
          const score = (coverage * 0.6) + (positionScore * 0.4);
          maxScore = Math.max(maxScore, score);
        }
      }
    });

    return maxScore;
  }

  /**
   * Parse search query for operators
   * @private
   */
  parseQuery(query) {
    const operators = {
      text: '',
      tags: [],
      priority: null,
      dueDate: null
    };

    // Extract tag: operator
    const tagMatch = query.match(/tag:(\w+)/g);
    if (tagMatch) {
      operators.tags = tagMatch.map(t => t.replace('tag:', ''));
      query = query.replace(/tag:\w+/g, '').trim();
    }

    // Extract priority: operator
    const priorityMatch = query.match(/priority:(\w+)/);
    if (priorityMatch) {
      operators.priority = priorityMatch[1];
      query = query.replace(/priority:\w+/, '').trim();
    }

    // Extract due: operator
    const dueMatch = query.match(/due:(\w+)/);
    if (dueMatch) {
      operators.dueDate = dueMatch[1];
      query = query.replace(/due:\w+/, '').trim();
    }

    operators.text = query.trim();
    return operators;
  }

  /**
   * Check if item matches text query
   * @private
   */
  matchesText(item, text) {
    const searchableText = [
      item.title,
      item.description,
      item.name
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableText.includes(text.toLowerCase());
  }

  /**
   * Check if date matches filter
   * @private
   */
  matchesDateFilter(date, filter) {
    if (!date) return false;

    const itemDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter.toLowerCase()) {
      case 'today':
        return itemDate.toDateString() === today.toDateString();
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return itemDate.toDateString() === tomorrow.toDateString();
      case 'overdue':
        return itemDate < today;
      case 'week':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return itemDate >= today && itemDate <= nextWeek;
      default:
        return true;
    }
  }

  /**
   * Add query to search history
   * @private
   */
  addToHistory(query) {
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(q => q !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Trim to max size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }
  }
}

// Singleton instance
let searchServiceInstance = null;

// PUBLIC_INTERFACE
/**
 * Get the SearchService singleton instance
 * @returns {SearchService} Service instance
 */
export const getSearchService = () => {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchService();
  }
  return searchServiceInstance;
};

export default SearchService;
