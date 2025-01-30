import React from 'react';
import { cn } from './cn';

export const RedButton = ({ children, className, ...props }) => (
  <button
    className={cn(
      'px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
