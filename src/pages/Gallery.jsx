import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCcw, VideoOff, ArrowUpDown } from 'lucide-react';
import VideoCard from '../components/common/VideoCard';
import SkeletonCard from '../components/common/SkeletonCard';
import SearchBar from '../components/common/SearchBar';
import CategoryFilter from '../components/common/CategoryFilter';
import { projectService } from '../lib/supabase';
import { CATEGORIES } from '../lib/projectsData';

const ITEMS_PER_PAGE = 6;

export default function Gallery() {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Fetch projects from Supabase or fallback
  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const data = await projectService.getProjects({
          category: 'All',
          search: '',
          sortBy: 'newest',
        });
        setAllProjects(data);
      } catch (err) {
        console.error('Error fetching gallery projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: allProjects.length };
    CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = allProjects.filter(
        (p) => p.category.toLowerCase() === cat.toLowerCase()
      ).length;
    });
    return counts;
  }, [allProjects]);

  // Client-side filtering and sorting for instant responsiveness
  const filteredProjects = useMemo(() => {
    let result = [...allProjects];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const clientMatch = p.client?.toLowerCase().includes(q);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || clientMatch || tagMatch;
      });
    }

    // Sort
    if (sortBy === 'most_viewed') {
      result.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      // newest
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return result;
  }, [allProjects, selectedCategory, searchQuery, sortBy]);

  // Sliced for pagination / load more
  const displayedProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1680px] mx-auto transition-colors duration-500 font-sans">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left space-y-2">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#FF6B4A] font-semibold block">
          FrameVerse Archive
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
          Portfolio & Case Studies
        </h1>
        <p className="text-sm sm:text-base text-[#737373] dark:text-[#A3A3A3] max-w-2xl font-light leading-relaxed">
          Browse through commercial campaigns, narrative films, music videos, and creative experiments. Filter by category or search across project attributes.
        </p>
      </div>

      {/* Control Bar: Search, Category Filters, and Sort */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Live Search */}
          <div className="w-full md:flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setVisibleCount(ITEMS_PER_PAGE * 2);
              }}
              placeholder="Search title, brand, role, or tags (e.g. Anamorphic, VFX)..."
            />
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-auto flex items-center gap-2 shrink-0">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                <ArrowUpDown className="w-4 h-4 text-[#FF6B4A]" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-3 rounded-xl glass-input text-xs font-mono text-[#171717] dark:text-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 cursor-pointer appearance-none border border-[#E5E5E5] dark:border-[#262626] shadow-sm"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="most_viewed">Sort: Most Viewed</option>
                <option value="title">Sort: Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setVisibleCount(ITEMS_PER_PAGE * 2);
            }}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>

      {/* Active filters status bar */}
      {(searchQuery || selectedCategory !== 'All') && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#737373] dark:text-[#A3A3A3] bg-[#F5F5F5] dark:bg-[#171717] px-4 py-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
          <div className="flex items-center gap-2 flex-wrap font-mono">
            <span>
              Showing <strong className="text-[#171717] dark:text-[#FAFAFA]">{filteredProjects.length}</strong> of{' '}
              {allProjects.length} projects
            </span>
            {selectedCategory !== 'All' && (
              <span className="px-2 py-0.5 rounded bg-[#FF6B4A]/10 text-[#FF6B4A] font-medium">
                Category: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#171717] dark:text-[#FAFAFA]">
                Query: "{searchQuery}"
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[#FF6B4A] hover:underline font-mono flex items-center gap-1 shrink-0"
          >
            <RefreshCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      )}

      {/* Projects Grid (Responsive 1-col on mobile, 2 on sm, 3 on md, 4 on lg) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center bg-[#F5F5F5] dark:bg-[#171717] rounded-3xl border border-[#E5E5E5] dark:border-[#262626] max-w-xl mx-auto p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-[#737373] dark:text-[#A3A3A3]">
            <VideoOff className="w-8 h-8 text-[#FF6B4A]" />
          </div>
          <h3 className="text-xl font-bold text-[#171717] dark:text-[#FAFAFA]">No projects found</h3>
          <p className="text-sm text-[#737373] dark:text-[#A3A3A3] max-w-md mx-auto font-light leading-relaxed">
            We couldn't find any video projects matching your active filters or search terms. Try clearing the search or exploring another category.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-primary px-6 py-2.5 rounded-xl text-xs font-mono font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {displayedProjects.map((project) => (
              <VideoCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination / Load More */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                className="btn-secondary w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-mono font-semibold"
              >
                Load More Projects ({filteredProjects.length - displayedProjects.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
