import React, { forwardRef, RefObject } from 'react';
import { SortMoji } from './SortMoji';

interface Props {
  id?: string;
  isActive?: boolean;
  inContainer?: boolean;
  children?: React.ReactNode;
  style?: any;
  wie?: 'Vriend' | 'Kennis' | 'Idool' | 'Onbekende';
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, Props>(
  ({ children, isActive, inContainer, className, wie, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={`${className} card-drag transition-shadow duration-300 bg-white text-xs border border-transparent
        ${!isActive && !inContainer && ' text-primary-dark shadow border-2 border-primary-light'}
        ${isActive && !inContainer && ' text-primary-dark shadow-2xl  border border-primary'}
        ${!isActive && inContainer && ' text-gray-400 shadow border-2 border-white'}
        ${false && isActive && inContainer && 'shadow-2xl text-primary-dark border border-gray-400'}`}
        >
        {children}

        {wie && (
          <div className="absolute text-xl transform right-1 bottom-1">
            {wie === 'Onbekende' && <SortMoji text="🚶" />}
            {wie === 'Kennis' && <SortMoji text="🧑" />}
            {wie === 'Vriend' && <SortMoji text="🙂" />}
            {wie === 'Idool' && <SortMoji text="😎" />}
          </div>
        )}
      </div>
    );
  }
);
