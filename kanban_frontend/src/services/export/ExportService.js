/**
 * ExportService - Handles exporting board data to various formats
 * Supports JSON, CSV, and Markdown formats
 */
class ExportService {
  // PUBLIC_INTERFACE
  /**
   * Export board data to JSON
   * @param {Object} board - Board to export
   * @param {Array} columns - Board columns
   * @param {Array} cards - Board cards
   * @returns {string} JSON string
   */
  exportToJSON(board, columns, cards) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      board: {
        id: board.id,
        name: board.name,
        description: board.description,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        starred: board.starred,
        archived: board.archived
      },
      columns: columns.map(col => ({
        id: col.id,
        name: col.name,
        position: col.position,
        color: col.color
      })),
      cards: cards.map(card => ({
        id: card.id,
        columnId: card.columnId,
        title: card.title,
        description: card.description,
        position: card.position,
        priority: card.priority,
        dueDate: card.dueDate,
        labels: card.labels,
        tags: card.tags,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // PUBLIC_INTERFACE
  /**
   * Export board data to CSV
   * @param {Array} cards - Cards to export
   * @param {Array} columns - Columns for reference
   * @returns {string} CSV string
   */
  exportToCSV(cards, columns) {
    const columnMap = columns.reduce((map, col) => {
      map[col.id] = col.name;
      return map;
    }, {});

    // CSV header
    const headers = [
      'Title',
      'Description',
      'Column',
      'Priority',
      'Due Date',
      'Labels',
      'Tags',
      'Created At',
      'Updated At'
    ];

    // CSV rows
    const rows = cards.map(card => [
      this.escapeCSV(card.title),
      this.escapeCSV(card.description || ''),
      this.escapeCSV(columnMap[card.columnId] || ''),
      card.priority || '',
      card.dueDate || '',
      this.escapeCSV((card.labels || []).map(l => l.name).join(', ')),
      this.escapeCSV((card.tags || []).join(', ')),
      card.createdAt || '',
      card.updatedAt || ''
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // PUBLIC_INTERFACE
  /**
   * Export board data to Markdown
   * @param {Object} board - Board to export
   * @param {Array} columns - Board columns
   * @param {Array} cards - Board cards
   * @returns {string} Markdown string
   */
  exportToMarkdown(board, columns, cards) {
    let markdown = `# ${board.name}\n\n`;

    if (board.description) {
      markdown += `${board.description}\n\n`;
    }

    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    columns.forEach(column => {
      markdown += `## ${column.name}\n\n`;

      const columnCards = cards.filter(card => card.columnId === column.id);

      if (columnCards.length === 0) {
        markdown += '*No cards in this column*\n\n';
      } else {
        columnCards.forEach(card => {
          markdown += `### ${card.title}\n\n`;

          if (card.description) {
            markdown += `${card.description}\n\n`;
          }

          const metadata = [];
          if (card.priority) {
            metadata.push(`**Priority:** ${card.priority}`);
          }
          if (card.dueDate) {
            metadata.push(`**Due:** ${new Date(card.dueDate).toLocaleDateString()}`);
          }
          if (card.labels && card.labels.length > 0) {
            metadata.push(`**Labels:** ${card.labels.map(l => l.name).join(', ')}`);
          }

          if (metadata.length > 0) {
            markdown += metadata.join(' | ') + '\n\n';
          }

          markdown += '---\n\n';
        });
      }
    });

    return markdown;
  }

  // PUBLIC_INTERFACE
  /**
   * Download data as file
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // PUBLIC_INTERFACE
  /**
   * Export and download board as JSON
   * @param {Object} board - Board to export
   * @param {Array} columns - Board columns
   * @param {Array} cards - Board cards
   */
  exportBoardAsJSON(board, columns, cards) {
    const json = this.exportToJSON(board, columns, cards);
    const filename = `${this.sanitizeFilename(board.name)}-${Date.now()}.json`;
    this.downloadFile(json, filename, 'application/json');
  }

  // PUBLIC_INTERFACE
  /**
   * Export and download cards as CSV
   * @param {Array} cards - Cards to export
   * @param {Array} columns - Columns for reference
   * @param {string} boardName - Board name for filename
   */
  exportCardsAsCSV(cards, columns, boardName) {
    const csv = this.exportToCSV(cards, columns);
    const filename = `${this.sanitizeFilename(boardName)}-cards-${Date.now()}.csv`;
    this.downloadFile(csv, filename, 'text/csv');
  }

  // PUBLIC_INTERFACE
  /**
   * Export and download board as Markdown
   * @param {Object} board - Board to export
   * @param {Array} columns - Board columns
   * @param {Array} cards - Board cards
   */
  exportBoardAsMarkdown(board, columns, cards) {
    const markdown = this.exportToMarkdown(board, columns, cards);
    const filename = `${this.sanitizeFilename(board.name)}-${Date.now()}.md`;
    this.downloadFile(markdown, filename, 'text/markdown');
  }

  /**
   * Escape CSV field content
   * @private
   */
  escapeCSV(field) {
    if (field == null) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Sanitize filename
   * @private
   */
  sanitizeFilename(name) {
    return name
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }
}

// Singleton instance
let exportServiceInstance = null;

// PUBLIC_INTERFACE
/**
 * Get the ExportService singleton instance
 * @returns {ExportService} Service instance
 */
export const getExportService = () => {
  if (!exportServiceInstance) {
    exportServiceInstance = new ExportService();
  }
  return exportServiceInstance;
};

export default ExportService;
