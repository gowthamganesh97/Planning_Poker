// src/components/Card.jsx
import React from 'react';

/**
 * Card component (large, accessible)
 * props:
 *  - value: string (label shown)
 *  - selected: bool
 *  - onClick: function(value)
 */
export default function Card({ value, selected, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`card ${selected ? 'card-selected' : ''}`}
      onClick={() => onClick && onClick(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(value);
        }
      }}
      aria-pressed={selected ? 'true' : 'false'}
      aria-label={`Card ${value}`}
    >
      <span>{value}</span>
    </div>
  );
}
