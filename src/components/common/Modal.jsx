import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} bg-[#FFFFFF] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 text-[#171717] dark:text-[#FAFAFA] font-sans`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
          <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}
