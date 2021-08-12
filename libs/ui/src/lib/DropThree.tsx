import React from 'react';
import { Drop } from './Drop';
import { Droppable } from './Droppable';

export const DropThree = (props: { text: string[] }) => (
    <div className="flex-1 flex justify-around w-full">
      {[0, 1, 2].map((text, key) => {
        return (
          <div key={key} className="flex flex-col-reverse">
            <Droppable
              key={key}
              id={key.toString()}
            >
              {/* <Drop></Drop> */}
            </Droppable>
            <div className="text-xs mt-4 text-gray-500" style={{width: 160, height: 60}}>
              {props.text[key]}
            </div>
          </div>
        );
      })}
    </div>
  );