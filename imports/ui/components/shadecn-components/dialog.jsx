import React from 'react';
import { Dialog as RadixDialog, DialogContent as RadixDialogContent } from '@radix-ui/react-dialog';
import { cn } from '../shadecn-components/cn';

export const Dialog = ({ children, ...props }) => (
  <RadixDialog {...props}>{children}</RadixDialog>
);

export const DialogContent = ({ className, ...props }) => (
  <RadixDialogContent
    className={cn(
      'fixed z-50 max-w-lg p-4 bg-white shadow-lg rounded-md',
      className
    )}
    {...props}
  />
);

export const DialogHeader = ({ children }) => (
  <div className="mb-2">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-bold">{children}</h2>
);
