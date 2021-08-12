import React from 'react';
import { Drop }  from './Drop';
import { Droppable } from './Droppable';

export const wyberVorm = [1, 3, 4, 3, 1].map((columnCount, rowIndex) => {
  return Array.from({ length: columnCount }).map((_, columnIndex) => {
    return `${rowIndex + 1}_${columnIndex + 1}`;
  });
});

export const DropWyber = () => (
  <div className="w-full flex justify-center inset-x-0 top-0">
    {wyberVorm.map((row, horizontalIndex) => (
      <div key={horizontalIndex} className="flex flex-col justify-center">
        {row.map((key) => (
          <Droppable key={key} id={key}>
            <Drop></Drop>
          </Droppable>
        ))}
      </div>
    ))}
  </div>
);