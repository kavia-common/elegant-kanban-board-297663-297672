import React from 'react';
import './HighlightText.css';

// PUBLIC_INTERFACE
/**
 * Component to highlight matching text within a string
 * @param {Object} props - Component props
 * @param {string} props.text - The full text to display
 * @param {string} props.query - The search query to highlight
 * @param {string} props.className - Optional CSS class name
 * @returns {React.ReactElement} Text with highlighted matches
 * 
 * @example
 * <HighlightText text="Complete task" query="task" />
 */
const HighlightText = ({ text, query, className = '' }) => {
  // Don't highlight if query is empty or too short
  if (!query || query.length < 2 || !text) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in the query
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  try {
    // Create case-insensitive regex to find all matches
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Check if this part matches the query (case-insensitive)
          const isMatch = part.toLowerCase() === query.toLowerCase();
          
          return isMatch ? (
            <mark key={index} className="highlight-match">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </span>
    );
  } catch (error) {
    // If regex fails, return original text
    console.error('Error highlighting text:', error);
    return <span className={className}>{text}</span>;
  }
};

export default HighlightText;
