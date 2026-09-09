import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  ArrowRight,
  Award,
  Video,
  Eye,
  Camera,
  Layers,
  ChevronRight,
  Film
} from 'lucide-react';
import VideoCard from '../components/common/VideoCard';
import SkeletonCard from '../components/common/SkeletonCard';
import Modal from '../components/common/Modal';
import HeroCinematicVisual from '../components/common/HeroCinematicVisual';
import VideoPlayer from '../components/common/VideoPlayer';
import { projectService } from '../lib/supabase';
import { formatViews, getYouTubeThumbnail } from '../lib/utils';

const DEFAULT_LATEST_THUMB = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reelModalOpen, setReelModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeaturedProjects() {
      try {
        setLoading(true);
        // Load latest productions sorted by created_at descending
        const data = await projectService.getProjects({ sortBy: 'newest' });
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects for Home:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedProjects();
  }, []);

  // Latest Reel showcase (the most recently added project/video from database)
  const latestReel = projects[0];
  // Recent productions - ensure newly uploaded videos are visible in the grid across mobile & desktop
  const recentProjects = projects.slice(0, 6);

  // Calculate live total views across all projects
  const totalViews = projects.reduce((acc, p) => acc + (Number(p.views) || 0), 0);

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] overflow-hidden transition-colors duration-500 font-sans">
      {/* 1. HERO SECTION (Split Two-Column Layout with Film Grain, Soft Vignette & Showreel Visual) */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 overflow-hidden">
        {/* Subtle Film Grain Texture Overlay */}
        <div className="absolute inset-0 hero-grain z-0" aria-hidden="true" />

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 hero-vignette z-0" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* LEFT HALF: Copy, Typography, Action CTAs, and Studio Stats */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-[11px] sm:text-xs font-mono text-[#737373] dark:text-[#A3A3A3] backdrop-blur-md shadow-sm animate-in fade-in duration-500 max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] shadow-[0_0_8px_#ff6b4a] shrink-0" />
                <span className="truncate">Director Yashu • Creative Studio Portfolio</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] sm:leading-[1.08] text-[#171717] dark:text-[#FAFAFA]">
                Transforming Concepts Into{' '}
                <span className="text-[#FF6B4A] italic font-serif font-normal drop-shadow-[0_0_12px_rgba(255,107,74,0.35)]">
                  Cinematic Reality
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-[#737373] dark:text-[#A3A3A3] max-w-2xl font-light leading-relaxed">
                High-caliber commercials, music videos, narrative films, and cutting-edge visual effects crafted by <strong>Yashu</strong> with precision color grading and intentional storytelling.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                {/* Primary CTA */}
                <button
                  onClick={() => setReelModalOpen(true)}
                  className="btn-primary w-full sm:w-auto px-7 py-3.5 text-sm rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  <span>Watch 2026 Showreel</span>
                </button>

                {/* Secondary CTA */}
                <Link
                  to="/gallery"
                  className="btn-secondary w-full sm:w-auto px-7 py-3.5 text-sm rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Explore Portfolio</span>
                  <ArrowRight className="w-4 h-4 text-[#FF6B4A]" />
                </Link>
              </div>

              {/* Live Studio Stats Bar */}
              <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full">
                <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-center shadow-sm">
                  <div className="text-lg sm:text-2xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">
                    {totalViews > 0 ? formatViews(totalViews) : '216.8K'}
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] mt-1 flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3 text-[#FF6B4A]" />
                    Total Views
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-center shadow-sm">
                  <div className="text-lg sm:text-2xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">
                    {projects.length > 0 ? `${projects.length}+` : '10+'}
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] mt-1 flex items-center justify-center gap-1">
                    <Video className="w-3 h-3 text-[#FF6B4A]" />
                    Productions
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-center shadow-sm">
                  <div className="text-lg sm:text-2xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">14</div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] mt-1 flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-[#FF6B4A]" />
                    Awards
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-center shadow-sm">
                  <div className="text-lg sm:text-2xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">100%</div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] mt-1 flex items-center justify-center gap-1">
                    <Film className="w-3 h-3 text-[#FF6B4A]" />
                    Deliverables
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT HALF: Layered Cinematic Showreel Visual Collage */}
            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end mt-4 lg:mt-0">
              <HeroCinematicVisual onWatchReel={() => setReelModalOpen(true)} />
            </div>
          </div>

          {/* Minimal Scroll Down Indicator */}
          <div className="flex flex-col items-center justify-center gap-2 pt-10 sm:pt-14 pb-2 text-center opacity-70 hover:opacity-100 transition-opacity">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#737373] dark:text-[#A3A3A3]">
              Scroll to Explore
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[#FF6B4A]/50 to-transparent relative overflow-hidden">
              <div className="w-full h-2 bg-[#FF6B4A] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST REEL / SHOWREEL SPOTLIGHT (Pulls most recently added project) */}
      {latestReel && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-widest text-[#FF6B4A] font-semibold block">
                Latest Reel
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight mt-1">
                Latest Showreel
              </h2>
            </div>
            <Link
              to={`/project/${latestReel.id}`}
              className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] flex items-center gap-1 group font-mono transition-colors"
            >
              <span>View Case Study</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Large Showcase Card (Stacked on mobile, side-by-side on lg) */}
          <div className="relative rounded-3xl overflow-hidden bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] group shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Media preview */}
              <div className="lg:col-span-8 relative aspect-video overflow-hidden bg-[#0A0A0A]">
                <img
                  src={
                    (latestReel.thumbnail_url && latestReel.thumbnail_url.trim()) ||
                    getYouTubeThumbnail(latestReel.video_url) ||
                    DEFAULT_LATEST_THUMB
                  }
                  alt={latestReel.title}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_LATEST_THUMB;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent" />
                <Link
                  to={`/project/${latestReel.id}`}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label={`Play ${latestReel.title}`}
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#FF6B4A] hover:bg-[#FF8566] text-[#0A0A0A] flex items-center justify-center shadow-[0_0_25px_rgba(255,107,74,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                  </div>
                </Link>
              </div>

              {/* Information */}
              <div className="lg:col-span-4 p-5 sm:p-8 flex flex-col justify-between bg-white/80 dark:bg-[#171717]/90 border-t lg:border-t-0 lg:border-l border-[#E5E5E5] dark:border-[#262626]">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/25 font-semibold">
                      {latestReel.category}
                    </span>
                    {latestReel.client && (
                      <span className="text-xs font-mono text-[#737373] dark:text-[#A3A3A3]">
                        {latestReel.client}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-2xl font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
                    {latestReel.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] leading-relaxed line-clamp-3 sm:line-clamp-4">
                    {latestReel.description}
                  </p>

                  {/* Production tools */}
                  {latestReel.technologies && (
                    <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                        Pipeline & Tools
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(latestReel.technologies)
                          ? latestReel.technologies
                          : latestReel.technologies.split(',').map((t) => t.trim())
                        )
                          .slice(0, 3)
                          .map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 text-[#737373] dark:text-[#A3A3A3] text-[11px] font-mono border border-[#E5E5E5] dark:border-[#262626]"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#A3A3A3] font-mono">
                    <Eye className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>{formatViews(latestReel.views)} views</span>
                  </div>

                  <Link
                    to={`/project/${latestReel.id}`}
                    className="btn-primary text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                  >
                    <span>Watch Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. CURATED RECENT PRODUCTIONS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-widest text-[#FF6B4A] font-semibold block">
              Curated Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight mt-1">
              Recent Productions
            </h2>
          </div>

          <Link
            to="/gallery"
            className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold"
          >
            <span>View All ({projects.length}) Projects</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF6B4A]" />
          </Link>
        </div>

        {/* Video Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentProjects.map((project) => (
              <VideoCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* 5. DIRECTOR / CAPABILITIES & GEAR DOSSIER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] p-8 sm:p-12 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B4A]/08 blur-3xl pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/25 font-semibold">
                Director Yashu // Philosophy & Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
                Sculpting Light, Sound, and Emotion Into Unforgettable Frames
              </h2>
              <p className="text-[#737373] dark:text-[#A3A3A3] text-sm sm:text-base leading-relaxed font-light">
                Operating out of Andhra Pradesh and collaborating globally, <strong>Yashu</strong> brings over a decade of dedication behind the camera and inside color suites. My work combines kinetic visual editing with intentional cinematic palettes, delivering broadcast commercials, music videos, and narrative stories that endure.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
                  <Camera className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717] dark:text-[#FAFAFA]">Cinematography</h4>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-1 font-mono">
                      RED Komodo 6K, ARRI Alexa Mini LF, high-speed Phantom Flex & anamorphic glass.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
                  <Layers className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717] dark:text-[#FAFAFA]">Post & Color Grading</h4>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-1 font-mono">
                      DaVinci Resolve Studio (ACES pipeline), After Effects, Cinema 4D, and spatial audio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand partners */}
            <div className="lg:col-span-5 bg-white/70 dark:bg-[#0A0A0A]/70 p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] space-y-4 shadow-sm">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] font-semibold">
                Industry Commissions & Collaborations
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  'APEX AUTOMOTIVE',
                  'GHOST LIGHT RECORDS',
                  'NORDIC GEO',
                  'TENSOR CORE',
                  'MAISON ÉTHÉRÉ',
                  'KROMA FESTIVAL',
                ].map((brand, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-center flex items-center justify-center text-xs font-mono font-semibold tracking-wider text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] hover:border-[#FF6B4A]/50 transition-colors shadow-sm"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-[#F5F5F5] dark:bg-[#171717] border border-[#FF6B4A]/30 shadow-md">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
            Ready to Direct Your Next Project?
          </h2>
          <p className="text-sm sm:text-base text-[#737373] dark:text-[#A3A3A3] max-w-xl mx-auto mt-4 leading-relaxed font-light">
            Currently accepting bookings for upcoming commercial productions, music videos, and narrative film projects with Yashu.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm rounded-xl font-bold"
            >
              Initiate Project Discussion
            </Link>
            <Link
              to="/gallery"
              className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-sm rounded-xl"
            >
              Browse Full Archive
            </Link>
          </div>
        </div>
      </section>

      {/* Showreel Quick Modal */}
      <Modal
        isOpen={reelModalOpen}
        onClose={() => setReelModalOpen(false)}
        title="2026 Director Showreel Master"
        maxWidth="max-w-4xl"
      >
        {reelModalOpen && (
          <VideoPlayer
            videoType="youtube"
            src="https://www.youtube.com/watch?v=ScMzIvxBSi4"
            title="Showreel Player"
            autoPlay={true}
            className="rounded-xl overflow-hidden"
          />
        )}
      </Modal>
    </div>
  );
}
