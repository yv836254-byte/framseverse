import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search projects by title, client, or tag..." }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
        <Search className="w-4 h-4 text-[#FF6B4A]" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 transition-all duration-200 font-sans"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] transition-colors"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
