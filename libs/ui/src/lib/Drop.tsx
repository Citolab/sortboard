import React, { forwardRef, RefObject } from 'react';
import { SortMoji } from './SortMoji';

interface Props {
  id?: string;
  isActive?: boolean;
  inContainer?: boolean;
  children?: React.ReactNode;
  style?: any;
  wie?: string;
  isOver?: boolean;
  disabled?: boolean;
  // children? : React.ReactNode
}

export const Drop = forwardRef<HTMLDivElement, Props>(
  ({ children, isActive, inContainer, isOver, ...props }, ref) => {
    return (
      <div
        className={`card-drop  border bg-white text-xs  text-gray-500 z-0 
        ${props.disabled ? 'border-green-400':'border-blue-400'}

        `}
        {...props}
        ref={ref}
      >{children}</div>
    );
  }
);

        // ${
        //   isOver || props.disabled && 'm-0.5 p-4' 
        // }