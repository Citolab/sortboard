import React from 'react';

// PK: Just a presentational component of a card, no logic
export function CardBadge({children}) {
  // somehow rounded-full does not work
  return (
    children ? <div className="w-11 h-11  bg-white text-primary shadow border border-gray-200 rounded-full flex items-center justify-center text-sm tracking-tight font-extrabold">{children}</div> : <span></span>
  );
};
