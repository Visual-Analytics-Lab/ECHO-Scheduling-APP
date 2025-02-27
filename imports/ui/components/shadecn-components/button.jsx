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
export const GreenButton = ({ children, className, ...props }) => (
  <button
    className={cn(
      'px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
export const GrayButton = ({ children, className, ...props }) => (
  <button
    className={cn(
      'px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
