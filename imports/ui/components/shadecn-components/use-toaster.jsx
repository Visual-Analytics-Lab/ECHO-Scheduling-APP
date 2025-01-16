import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  function toast({ message, type }) {
    setToasts((prev) => [...prev, { message, type }]);
  }

  return { toast, toasts };
}
