import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = {
  id: number;
  message: string;
};

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((currentToasts) => [...currentToasts, { id, message }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};