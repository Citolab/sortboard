import React, { forwardRef, RefObject } from 'react';

export const Tab = (props) => (
  <button
    onClick={(event) => {
      props.onClick(event);
    }}
    disabled={props.disabled ?? false}
    className={`header py-2 font-bold text-base text-md text-primary
    ${
      !props.selected ? `border-b-4 border-primary` : `border-b-4 border-transparent`
    }  ${props.className}`}
  >
    {props.children}
  </button>
);
