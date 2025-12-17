import React, { useState, useEffect, useRef } from 'react';
import './EmojiPicker.css';

// Curated emoji set organized by category
const EMOJI_CATEGORIES = {
  'Recently Used': [],
  'Work & Office': ['📋', '📊', '📈', '💼', '📁', '📝', '✅', '📌', '🎯', '💡'],
  'Objects': ['📦', '🎨', '🔧', '⚙️', '🔨', '🛠️', '📱', '💻', '⌨️', '🖥️'],
  'Nature': ['🌟', '⭐', '✨', '🔥', '💧', '🌈', '☀️', '🌙', '⚡', '🌊'],
  'Symbols': ['❤️', '💚', '💙', '💜', '🧡', '💛', '🖤', '🤍', '🚀', '⚠️'],
  'Faces': ['😀', '😊', '🎉', '👍', '👏', '🙌', '💪', '🤝', '✌️', '👋']
};

// PUBLIC_INTERFACE
/**
 * EmojiPicker component for selecting board emojis
 * @param {Object} props - Component props
 * @param {string} props.currentEmoji - Currently selected emoji
 * @param {Function} props.onEmojiSelect - Callback when emoji is selected
 * @param {Function} props.onClose - Callback to close the picker
 * @param {Object} props.anchorEl - Element to anchor the popover to
 */
const EmojiPicker = ({ currentEmoji, onEmojiSelect, onClose, anchorEl }) => {
  const [recentEmojis, setRecentEmojis] = useState([]);
  const popoverRef = useRef(null);
  const firstButtonRef = useRef(null);

  // Load recently used emojis from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentEmojis');
      if (stored) {
        setRecentEmojis(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent emojis:', error);
    }
  }, []);

  // Position the popover relative to anchor element
  useEffect(() => {
    if (popoverRef.current && anchorEl) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const popover = popoverRef.current;
      
      // Position to the right of the anchor with some offset
      const top = anchorRect.top;
      const left = anchorRect.right + 8;
      
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      
      // Adjust if overflowing viewport
      const popoverRect = popover.getBoundingClientRect();
      if (popoverRect.right > window.innerWidth) {
        popover.style.left = `${anchorRect.left - popoverRect.width - 8}px`;
      }
      if (popoverRect.bottom > window.innerHeight) {
        popover.style.top = `${window.innerHeight - popoverRect.height - 16}px`;
      }
    }
  }, [anchorEl]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && 
          anchorEl && !anchorEl.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, anchorEl]);

  // Focus trap inside popover
  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }

    const handleTab = (event) => {
      if (!popoverRef.current) return;

      const focusableElements = popoverRef.current.querySelectorAll(
        'button:not([disabled])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  const handleEmojiClick = (emoji) => {
    // Update recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 10);
    setRecentEmojis(newRecent);
    
    try {
      localStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    } catch (error) {
      console.error('Error saving recent emojis:', error);
    }

    onEmojiSelect(emoji);
    onClose();
  };

  // Build categories with recently used at the top
  const categories = recentEmojis.length > 0
    ? { 'Recently Used': recentEmojis, ...EMOJI_CATEGORIES }
    : EMOJI_CATEGORIES;

  return (
    <div className="emoji-picker-overlay">
      <div 
        ref={popoverRef}
        className="emoji-picker-popover"
        role="dialog"
        aria-label="Emoji picker"
        aria-modal="true"
      >
        <div className="emoji-picker-header">
          <h3 className="emoji-picker-title">Select Emoji</h3>
          <button
            className="emoji-picker-close"
            onClick={onClose}
            aria-label="Close emoji picker"
          >
            ✕
          </button>
        </div>

        <div className="emoji-picker-content">
          {Object.entries(categories).map(([category, emojis], categoryIndex) => {
            // Skip empty categories
            if (emojis.length === 0) return null;
            
            return (
              <div key={category} className="emoji-category">
                <h4 className="emoji-category-title">{category}</h4>
                <div className="emoji-grid">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${emoji}-${index}`}
                      ref={categoryIndex === 0 && index === 0 ? firstButtonRef : null}
                      className={`emoji-button ${currentEmoji === emoji ? 'selected' : ''}`}
                      onClick={() => handleEmojiClick(emoji)}
                      aria-label={`Select emoji ${emoji}`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
