import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Clock, Sparkles, FileVideo } from 'lucide-react';
import { formatViews, getYouTubeThumbnail } from '../../lib/utils';

export default function VideoCard({ project }) {
  const [imgSrc, setImgSrc] = useState(
    project.thumbnail_url || getYouTubeThumbnail(project.video_url)
  );

  const handleImageError = () => {
    const ytThumb = getYouTubeThumbnail(project.video_url);
    if (imgSrc !== ytThumb) {
      setImgSrc(ytThumb);
    } else {
      setImgSrc('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80');
    }
  };

  const isUploaded =
    project.video_type === 'upload' ||
    (project.video_url && !project.video_url.includes('youtube') && !project.video_url.includes('youtu.be'));

  return (
    <Link
      to={`/project/${project.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] transition-all duration-300 ease-out hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/50 hover:border-[#FF6B4A]/60 shadow-sm hover:shadow-[0_10px_25px_-5px_rgba(255,107,74,0.12)] dark:hover:shadow-[0_12px_32px_-5px_rgba(255,107,74,0.2)]"
    >
      {/* 16:9 Cinematic Preview Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0A0A0A]">
        <img
          src={imgSrc}
          alt={project.title}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Overlays (deepens on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-transparent opacity-60" />

        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-black/80 backdrop-blur-md border border-white/10 text-[#FF6B4A] font-medium shadow-sm">
            {project.category}
          </span>
          {isUploaded && (
            <span
              className="p-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[#FF6B4A]"
              title="Studio Uploaded Video"
            >
              <FileVideo className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-[#FF6B4A] text-[#0A0A0A] font-bold shadow-md">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured
            </span>
          </div>
        )}

        {/* Duration badge */}
        {project.duration && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/85 backdrop-blur-sm text-neutral-300 border border-white/10">
              <Clock className="w-3 h-3 text-neutral-400" />
              {project.duration}
            </span>
          </div>
        )}

        {/* Smooth Play Reveal Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-[#FF6B4A] hover:bg-[#FF8566] text-[#0A0A0A] flex items-center justify-center p-3 shadow-[0_0_20px_rgba(255,107,74,0.55)] opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-[#F5F5F5] dark:bg-[#171717] transition-colors duration-300">
        <div>
          {/* Client & Role */}
          {project.client && (
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#FF6B4A] mb-1 font-semibold">
              {project.client} {project.role ? `// ${project.role}` : ''}
            </p>
          )}

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-[#FAFAFA] transition-colors duration-200 group-hover:text-[#FF6B4A] line-clamp-1">
            {project.title}
          </h3>

          {/* Description Snippet */}
          {project.description && (
            <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-1 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Card Footer: Tags & Views */}
        <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between text-xs text-[#737373] dark:text-[#A3A3A3]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {project.tags && project.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-mono text-[#737373] dark:text-[#A3A3A3] border border-[#E5E5E5] dark:border-[#262626]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 ml-2 text-[#737373] dark:text-[#A3A3A3]">
            <Eye className="w-3.5 h-3.5 opacity-70" />
            <span>{formatViews(project.views)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
