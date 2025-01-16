import React from 'react';
import { cn } from '../shadecn-components/cn';

export const Alert = ({ children, className, ...props }) => (
  <div
    className={cn(
      'p-4 border rounded-md bg-yellow-100 border-yellow-300',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const AlertDescription = ({ children }) => (
  <p className="text-sm text-yellow-700">{children}</p>
);
