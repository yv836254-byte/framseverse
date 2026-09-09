import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Calendar,
  Share2,
  Clock,
  Briefcase,
  User,
  Check,
  Tag,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileVideo
} from 'lucide-react';
import { YoutubeIcon } from '../components/common/SocialIcons';
import { projectService } from '../lib/supabase';
import { formatViews, formatDate, parseTags } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import VideoCard from '../components/common/VideoCard';
import VideoPlayer from '../components/common/VideoPlayer';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);

  // Track if view count has been incremented for this session visit
  const viewCountedRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    viewCountedRef.current = false;

    async function loadProject() {
      try {
        setLoading(true);
        const [target, list] = await Promise.all([
          projectService.getProjectById(id),
          projectService.getProjects(),
        ]);
        setProject(target);
        setAllProjects(list);

        // Increment view count on mount
        if (!viewCountedRef.current) {
          viewCountedRef.current = true;
          projectService.incrementViews(id).then((updatedViews) => {
            if (updatedViews) {
              setProject((prev) => (prev ? { ...prev, views: updatedViews } : prev));
            }
          });
        }
      } catch (err) {
        console.error('Error loading project details:', err);
        showToast('Project could not be found.', 'error');
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id, navigate, showToast]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Project link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 transition-colors duration-500 font-sans">
        <div className="w-32 h-6 rounded bg-slate-100 dark:bg-white/05 animate-pulse" />
        <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-white/05 animate-shimmer" />
        <div className="space-y-4 max-w-2xl">
          <div className="w-1/2 h-8 rounded bg-slate-100 dark:bg-white/05 animate-pulse" />
          <div className="w-full h-4 rounded bg-slate-100 dark:bg-white/05 animate-pulse" />
          <div className="w-3/4 h-4 rounded bg-slate-100 dark:bg-white/05 animate-pulse" />
        </div>
      </div>
    );
  }

  // Related projects in the same category
  const relatedProjects = allProjects
    .filter((p) => String(p.id) !== String(project.id) && p.category === project.category)
    .slice(0, 3);

  const finalRelated =
    relatedProjects.length > 0
      ? relatedProjects
      : allProjects.filter((p) => String(p.id) !== String(project.id)).slice(0, 3);

  // Previous & Next navigation
  const currentIndex = allProjects.findIndex((p) => String(p.id) === String(project.id));
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  const isUploadedVideo =
    project.video_type === 'upload' ||
    (project.video_url && !project.video_url.includes('youtube') && !project.video_url.includes('youtu.be'));

  const tagsList = parseTags(project.tags);
  const techList = parseTags(project.technologies);

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-24 pb-28 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-sans">
      <div className={`${cinemaMode ? 'max-w-full' : 'max-w-7xl'} mx-auto transition-all duration-500`}>
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#FF6B4A]" />
            <span>// Back to Archive</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Cinema mode toggle */}
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] transition-colors shadow-sm"
              title="Toggle Cinema Mode"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>{cinemaMode ? 'Standard View' : 'Cinema Mode'}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] hover:bg-black/5 dark:hover:bg-white/5 border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#737373] dark:text-[#A3A3A3] transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. VIDEO PLAYER CONTAINER (Unified Cinema Player with Watermark in Fullscreen) */}
        <div className="mb-8 sm:mb-10 w-full max-w-full">
          <VideoPlayer
            videoType={isUploadedVideo ? 'upload' : 'youtube'}
            src={project.video_url}
            poster={project.thumbnail_url}
            title={project.title}
            className="border border-[#E5E5E5] dark:border-[#262626] shadow-2xl"
          />
        </div>

        {/* 2. PROJECT INFO & METADATA SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main narrative & details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-md text-[10px] uppercase font-mono tracking-wider bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20 font-semibold">
                  {project.category}
                </span>

                {/* Video format tag */}
                <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#A3A3A3] font-mono px-3 py-1 rounded-md bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
                  {isUploadedVideo ? (
                    <>
                      <FileVideo className="w-3.5 h-3.5 text-[#FF6B4A]" />
                      <span>Studio Upload</span>
                    </>
                  ) : (
                    <>
                      <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                      <span>YouTube Stream</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#A3A3A3] font-mono px-3 py-1 rounded-md bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
                  <Eye className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span>{formatViews(project.views)} views</span>
                </div>

                {project.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#A3A3A3] font-mono px-3 py-1 rounded-md bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{project.duration}</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight leading-tight">
                {project.title}
              </h1>
            </div>

            {/* Description / Story */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
                Project Narrative & Creative Treatment
              </h3>
              <p className="text-[#737373] dark:text-[#A3A3A3] leading-relaxed whitespace-pre-line text-base sm:text-lg font-light">
                {project.description || 'No narrative provided for this project.'}
              </p>
            </div>

            {/* Tags Cloud */}
            {tagsList.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3]">
                  <Tag className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span>Production Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#737373] dark:text-[#A3A3A3] shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Metadata Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-6 shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#171717] dark:text-[#FAFAFA] font-semibold border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
                Production Dossier
              </h3>

              <div className="space-y-4 text-xs font-mono">
                {/* Client */}
                {project.client && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-[#737373] dark:text-[#A3A3A3] block">
                        Client / Commission
                      </span>
                      <span className="text-[#171717] dark:text-[#FAFAFA] font-semibold text-sm font-sans">{project.client}</span>
                    </div>
                  </div>
                )}

                {/* Role */}
                {project.role && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-[#737373] dark:text-[#A3A3A3] block">
                        Director's Role
                      </span>
                      <span className="text-[#171717] dark:text-[#FAFAFA] font-semibold text-sm font-sans">{project.role}</span>
                    </div>
                  </div>
                )}

                {/* Date */}
                {project.created_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase text-[#737373] dark:text-[#A3A3A3] block">
                        Release Date
                      </span>
                      <span className="text-[#171717] dark:text-[#FAFAFA] font-semibold text-sm font-sans">
                        {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies / Gear */}
              {techList.length > 0 && (
                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3]">
                    <Wrench className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>Hardware & Software</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {techList.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[11px] font-mono text-[#737373] dark:text-[#A3A3A3] border border-[#E5E5E5] dark:border-[#262626]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Commission CTA */}
              <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Link
                  to="/contact"
                  className="btn-primary w-full text-xs font-bold py-3 rounded-xl"
                >
                  Commission Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. NEXT / PREVIOUS PROJECT NAVIGATION */}
        <div className="mt-16 pt-8 border-t border-[#E5E5E5] dark:border-[#262626] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevProject ? (
            <Link
              to={`/project/${prevProject.id}`}
              className="p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] flex items-center gap-3 group text-left shadow-sm hover:border-[#FF6B4A]/50"
            >
              <ChevronLeft className="w-5 h-5 text-[#FF6B4A] shrink-0 group-hover:-translate-x-1 transition-transform" />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Previous Project
                </span>
                <span className="text-sm font-bold text-[#171717] dark:text-[#FAFAFA] group-hover:text-[#FF6B4A] transition-colors line-clamp-1">
                  {prevProject.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              to={`/project/${nextProject.id}`}
              className="p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-end gap-3 group text-right sm:col-start-2 shadow-sm hover:border-[#FF6B4A]/50"
            >
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Next Project
                </span>
                <span className="text-sm font-bold text-[#171717] dark:text-[#FAFAFA] group-hover:text-[#FF6B4A] transition-colors line-clamp-1">
                  {nextProject.title}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#FF6B4A] shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* 4. RELATED PROJECTS SECTION */}
        {finalRelated.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E5E5E5] dark:border-[#262626] space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono tracking-widest text-[#FF6B4A] font-semibold block">
                  Explore More
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight mt-1">
                  Related Productions
                </h2>
              </div>
              <Link
                to="/gallery"
                className="text-xs font-mono text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A]"
              >
                // Browse Archive
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {finalRelated.map((rel) => (
                <VideoCard key={rel.id} project={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
