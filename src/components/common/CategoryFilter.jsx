import React from 'react';
import { CATEGORIES } from '../../lib/projectsData';

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          const count = categoryCounts[cat];

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-[#FF6B4A] text-[#0A0A0A] border-[#FF6B4A] font-bold shadow-[0_0_15px_rgba(255,107,74,0.35)]'
                  : 'bg-[#F5F5F5] dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] border-[#E5E5E5] dark:border-[#262626] hover:border-[#FF6B4A]/50'
              }`}
            >
              <span>{cat}</span>
              {typeof count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${
                    isSelected
                      ? 'bg-black/20 text-current'
                      : 'bg-black/5 dark:bg-white/5 text-[#737373] dark:text-[#A3A3A3]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
