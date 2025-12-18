/**
 * FilterService - Handles filtering operations for cards, boards, and columns
 * Provides flexible filtering with multiple criteria
 */
class FilterService {
  constructor() {
    this.activeFilters = {};
  }

  // PUBLIC_INTERFACE
  /**
   * Filter cards by multiple criteria
   * @param {Array} cards - Cards to filter
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered cards
   */
  filterCards(cards, filters = {}) {
    if (!filters || Object.keys(filters).length === 0) return cards;

    return cards.filter(card => {
      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(card.priority)) return false;
      }

      // Label/tag filter
      if (filters.labels && filters.labels.length > 0) {
        const cardLabels = card.labels || [];
        const hasLabel = filters.labels.some(label =>
          cardLabels.some(l => l.id === label || l.name === label)
        );
        if (!hasLabel) return false;
      }

      // Due date filter
      if (filters.dueDate) {
        if (!this.matchesDueDateFilter(card.dueDate, filters.dueDate)) return false;
      }

      // Assignee filter
      if (filters.assignees && filters.assignees.length > 0) {
        const cardAssignees = card.assignees || [];
        const hasAssignee = filters.assignees.some(assignee =>
          cardAssignees.includes(assignee)
        );
        if (!hasAssignee) return false;
      }

      // Archived filter
      if (filters.showArchived === false && card.archived) return false;

      // Custom field filters
      if (filters.customFields) {
        const matchesCustomFields = this.matchesCustomFields(card, filters.customFields);
        if (!matchesCustomFields) return false;
      }

      return true;
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Filter boards by criteria
   * @param {Array} boards - Boards to filter
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered boards
   */
  filterBoards(boards, filters = {}) {
    if (!filters || Object.keys(filters).length === 0) return boards;

    return boards.filter(board => {
      // Starred filter
      if (filters.starred === true && !board.starred) return false;

      // Archived filter
      if (filters.showArchived === false && board.archived) return false;

      // Recent filter (boards modified in last N days)
      if (filters.recent) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.recent);
        const boardDate = new Date(board.updatedAt || board.createdAt);
        if (boardDate < daysAgo) return false;
      }

      return true;
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Sort items by specified criteria
   * @param {Array} items - Items to sort
   * @param {string} sortBy - Sort field
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Array} Sorted items
   */
  sortItems(items, sortBy, order = 'asc') {
    if (!sortBy) return items;

    const sorted = [...items].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle dates
      if (sortBy.includes('date') || sortBy.includes('Date')) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      // Handle strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  // PUBLIC_INTERFACE
  /**
   * Group items by a field
   * @param {Array} items - Items to group
   * @param {string} groupBy - Field to group by
   * @returns {Object} Grouped items
   */
  groupItems(items, groupBy) {
    if (!groupBy) return { ungrouped: items };

    return items.reduce((groups, item) => {
      const key = item[groupBy] || 'none';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  // PUBLIC_INTERFACE
  /**
   * Get filter presets (common filter combinations)
   * @returns {Object} Filter presets
   */
  getFilterPresets() {
    return {
      myCards: {
        assignees: ['currentUser'],
        showArchived: false
      },
      highPriority: {
        priority: ['high', 'urgent'],
        showArchived: false
      },
      dueToday: {
        dueDate: 'today',
        showArchived: false
      },
      dueSoon: {
        dueDate: 'week',
        showArchived: false
      },
      overdue: {
        dueDate: 'overdue',
        showArchived: false
      },
      noDueDate: {
        dueDate: 'none',
        showArchived: false
      }
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Set active filters
   * @param {Object} filters - Filters to set
   */
  setActiveFilters(filters) {
    this.activeFilters = { ...filters };
  }

  // PUBLIC_INTERFACE
  /**
   * Get active filters
   * @returns {Object} Current active filters
   */
  getActiveFilters() {
    return { ...this.activeFilters };
  }

  // PUBLIC_INTERFACE
  /**
   * Clear all filters
   */
  clearFilters() {
    this.activeFilters = {};
  }

  // PUBLIC_INTERFACE
  /**
   * Check if any filters are active
   * @returns {boolean} Whether filters are active
   */
  hasActiveFilters() {
    return Object.keys(this.activeFilters).length > 0;
  }

  /**
   * Check if date matches filter criteria
   * @private
   */
  matchesDueDateFilter(dueDate, filter) {
    if (filter === 'none') return !dueDate;
    if (!dueDate) return false;

    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return date.toDateString() === today.toDateString();
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
      case 'week':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return date >= today && date <= nextWeek;
      case 'overdue':
        return date < today;
      case 'future':
        return date > today;
      default:
        return true;
    }
  }

  /**
   * Check if item matches custom field filters
   * @private
   */
  matchesCustomFields(item, customFieldFilters) {
    return Object.entries(customFieldFilters).every(([field, value]) => {
      const itemValue = item[field];
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      return itemValue === value;
    });
  }
}

// Singleton instance
let filterServiceInstance = null;

// PUBLIC_INTERFACE
/**
 * Get the FilterService singleton instance
 * @returns {FilterService} Service instance
 */
export const getFilterService = () => {
  if (!filterServiceInstance) {
    filterServiceInstance = new FilterService();
  }
  return filterServiceInstance;
};

export default FilterService;
