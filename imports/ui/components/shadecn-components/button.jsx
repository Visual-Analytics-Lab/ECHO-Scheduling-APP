import React from 'react';
import { cn } from '../shadecn-components/cn';

export const Button = ({ children, className, ...props }) => (
  <button
    className={cn(
      'px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
