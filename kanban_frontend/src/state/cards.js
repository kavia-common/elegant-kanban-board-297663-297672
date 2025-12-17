import { saveToIndexedDB, deleteFromIndexedDB, loadAllFromIndexedDB } from '../utils/storage';

// PUBLIC_INTERFACE
/**
 * Card entity type definition
 * @typedef {Object} Card
 * @property {string} id - Unique card identifier
 * @property {string} columnId - Parent column ID
 * @property {string} title - Card title
 * @property {string} description - Card description
 * @property {number} position - Sort order within column
 * @property {string|null} priority - Priority level ('low' | 'medium' | 'high' | 'critical')
 * @property {number|null} dueDate - Due date timestamp
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

// PUBLIC_INTERFACE
/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// PUBLIC_INTERFACE
/**
 * Create a new card
 * @param {Object} cardData - Card data
 * @returns {Promise<Card>} Created card object
 */
export const createCard = async (cardData) => {
  const card = {
    id: generateId(),
    columnId: cardData.columnId,
    title: cardData.title || 'Untitled Card',
    description: cardData.description || '',
    position: cardData.position || 0,
    priority: null,
    dueDate: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await saveToIndexedDB('cards', card);
  return card;
};

// PUBLIC_INTERFACE
/**
 * Update an existing card
 * @param {string} cardId - Card ID to update
 * @param {Object} updates - Updated card data
 * @returns {Promise<Card>} Updated card object
 */
export const updateCard = async (cardId, updates) => {
  const updatedCard = { 
    ...updates, 
    id: cardId, 
    updatedAt: Date.now() 
  };
  
  await saveToIndexedDB('cards', updatedCard);
  return updatedCard;
};

// PUBLIC_INTERFACE
/**
 * Delete a card
 * @param {string} cardId - Card ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteCard = async (cardId) => {
  return await deleteFromIndexedDB('cards', cardId);
};

// PUBLIC_INTERFACE
/**
 * Load all cards for a column
 * @param {string} columnId - Column ID
 * @returns {Promise<Card[]>} Array of cards
 */
export const loadCards = async (columnId) => {
  const allCards = await loadAllFromIndexedDB('cards');
  return allCards
    .filter(card => card.columnId === columnId)
    .sort((a, b) => a.position - b.position);
};

// PUBLIC_INTERFACE
/**
 * Load a single card
 * @param {string} cardId - Card ID
 * @returns {Promise<Card|null>} Card object or null
 */
export const loadCard = async (cardId) => {
  const cards = await loadAllFromIndexedDB('cards');
  return cards.find(c => c.id === cardId) || null;
};

// PUBLIC_INTERFACE
/**
 * Move card to a different column
 * @param {string} cardId - Card ID
 * @param {string} targetColumnId - Target column ID
 * @param {number} position - New position in target column
 * @returns {Promise<Card>} Updated card
 */
export const moveCard = async (cardId, targetColumnId, position) => {
  const card = await loadCard(cardId);
  if (!card) return null;
  
  const updatedCard = {
    ...card,
    columnId: targetColumnId,
    position,
    updatedAt: Date.now()
  };
  
  await saveToIndexedDB('cards', updatedCard);
  return updatedCard;
};
