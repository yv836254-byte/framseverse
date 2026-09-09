import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0 font-sans">
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-[#171717] border-[#E5E5E5] dark:border-[#262626] text-[#171717] dark:text-[#FAFAFA] shadow-xl';
          let icon = <Info className="w-5 h-5 text-[#FF6B4A] shrink-0" />;

          if (toast.type === 'success') {
            bgColor = 'bg-white dark:bg-[#171717] border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-xl';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-white dark:bg-[#171717] border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-xl';
            icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-white dark:bg-[#171717] border-[#FF6B4A]/40 text-[#FF6B4A] shadow-xl';
            icon = <AlertCircle className="w-5 h-5 text-[#FF6B4A] shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] transition-colors p-1 -mr-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
