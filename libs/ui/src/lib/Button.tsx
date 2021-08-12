import React, { forwardRef, RefObject } from 'react';

export const Button = (props) => (
  <button
    onClick={(event) => {
      props.onClick(event);
    }}
    disabled={props.disabled ?? false}
    className={`header px-4 py-2  text-base font-medium rounded-lg 
    ${
      !props.secondary ? `text-white bg-primary hover:bg-primary-dark border border-transparent` : `bg-white border-primary border-2 text-primary hover:bg-primary-light`
    }    md:py-4 md:text-lg md:px-10 ${props.className}`}
  >
    {props.children}
  </button>
);
