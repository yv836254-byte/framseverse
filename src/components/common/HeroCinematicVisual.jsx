import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, Sparkles } from 'lucide-react';

/**
 * HeroCinematicVisual
 *
 * Premium Cinematic Showreel Showcase:
 * - Large 16:9 anamorphic showreel preview card with authentic film-strip decorative edges
 * - Layered offset production cards creating physical depth
 * - Smooth mouse parallax movement (requestAnimationFrame)
 * - Broadcast Monitor HUD: Timecode, audio meters, 4K scope ratio, recording state
 * - Refined Olive Green play button with gentle pulsing glow and smooth hover expansion
 * - Clicking launches the master 2026 Showreel modal
 */
export default function HeroCinematicVisual({ onWatchReel }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);

  // Smooth damped parallax interpolation on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // Normalized between -1 and 1
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      targetOffsetRef.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      };
    };

    const animateParallax = () => {
      // Damped lerp
      currentOffsetRef.current.x +=
        (targetOffsetRef.current.x - currentOffsetRef.current.x) * 0.08;
      currentOffsetRef.current.y +=
        (targetOffsetRef.current.y - currentOffsetRef.current.y) * 0.08;

      setOffset({
        x: currentOffsetRef.current.x,
        y: currentOffsetRef.current.y,
      });

      rafIdRef.current = requestAnimationFrame(animateParallax);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    window.addEventListener('mousemove', handleMouseMove);
    rafIdRef.current = requestAnimationFrame(animateParallax);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-full sm:max-w-xl mx-auto select-none py-4 sm:py-6 lg:py-4 flex items-center justify-center cursor-pointer"
      onClick={onWatchReel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        targetOffsetRef.current = { x: 0, y: 0 };
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onWatchReel();
        }
      }}
      aria-label="Play 2026 Director Showreel"
    >
      {/* 1. Ambient Multi-Color Lighting Bloom Behind the Cards */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[480px] h-[260px] sm:h-[400px] pointer-events-none -z-10 transition-opacity duration-700"
        style={{
          transform: `translate(calc(-50% + ${offset.x * 12}px), calc(-50% + ${offset.y * 12}px))`,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B4A]/25 via-[#8B5CF6]/20 to-[#0D9488]/20 blur-3xl opacity-80 dark:opacity-90 animate-pulse-slow" />
      </div>

      {/* 2. BACKGROUND LAYER: Secondary Production Card (Tilted right & slightly up) */}
      <div
        className="absolute top-1 sm:top-2 -right-2 sm:-right-4 w-[85%] sm:w-[88%] aspect-video rounded-2xl overflow-hidden opacity-40 dark:opacity-30 pointer-events-none transform transition-transform duration-300 shadow-xl border border-[#FF6B4A]/20 dark:border-white/10 hidden sm:block"
        style={{
          transform: `translate(${offset.x * -14}px, ${offset.y * -14}px) rotate(4deg) scale(0.96)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
          alt="Production Still 1"
          className="w-full h-full object-cover filter saturate-50"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/40" />
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-[#FF6B4A] uppercase tracking-wider">
          HYPERION // 8K RAW
        </div>
      </div>

      {/* 3. MIDDLE LAYER: Tertiary Production Card (Tilted left & down) */}
      <div
        className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-4 w-[82%] sm:w-[85%] aspect-video rounded-2xl overflow-hidden opacity-35 dark:opacity-25 pointer-events-none transform transition-transform duration-300 shadow-lg border border-[#FF6B4A]/20 dark:border-white/10 hidden sm:block"
        style={{
          transform: `translate(${offset.x * 16}px, ${offset.y * 16}px) rotate(-3.5deg) scale(0.94)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80"
          alt="Production Still 2"
          className="w-full h-full object-cover filter saturate-50"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/40" />
        <div className="absolute top-2 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-[#FF6B4A] uppercase tracking-wider">
          AETHELGARD // 65MM
        </div>
      </div>

      {/* 4. FOREGROUND MASTERPIECE: Primary Showreel Video Preview Card */}
      <div
        className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border border-[#E5E5E5] dark:border-[#262626] group bg-[#0A0A0A]"
        style={{
          transform: `translate(${offset.x * 8}px, ${offset.y * 8}px) scale(${isHovered ? 1.02 : 1})`,
        }}
      >
        {/* Main Cinematic Video Still */}
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80"
          alt="2026 Showreel Master Preview"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Overlays for Cinematic Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-[#0A0A0A]/50 pointer-events-none" />

        {/* Decorative Top & Bottom Film-Strip Sprocket Holes */}
        <div className="absolute top-0 inset-x-0 h-4 bg-black/60 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-3 overflow-hidden pointer-events-none">
          <div className="flex gap-2.5 opacity-60">
            {[...Array(14)].map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-1.5 rounded-[1px] bg-white/40 border border-black/40 block"
              />
            ))}
          </div>
          <span className="text-[8px] font-mono tracking-widest text-[#FF6B4A] font-bold uppercase">
            KODAK 5219 // 35MM
          </span>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-4 bg-black/60 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-3 overflow-hidden pointer-events-none">
          <span className="text-[8px] font-mono tracking-widest text-neutral-400 font-semibold uppercase">
            EASTMAN COLOR // 24 FPS
          </span>
          <div className="flex gap-2.5 opacity-60">
            {[...Array(14)].map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-1.5 rounded-[1px] bg-white/40 border border-black/40 block"
              />
            ))}
          </div>
        </div>

        {/* Cinematic Monitor HUD Overlays */}
        {/* Top Header: Recording Status & Optics */}
        <div className="absolute top-6 inset-x-4 sm:inset-x-5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse shadow-[0_0_8px_#ff6b4a]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
              REC ● 00:01:24:18
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#FF6B4A] font-semibold">
            <Sparkles className="w-3 h-3 text-[#FF6B4A]" />
            <span>4K ANAMORPHIC • 2.39:1</span>
          </div>
        </div>

        {/* Center: Vibrant Coral Play Button with Pulsing Glow */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="relative group/btn flex items-center justify-center">
            {/* Outer Pulsing Glow */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 -m-3 ${
                isHovered
                  ? 'bg-[#FF6B4A]/40 blur-md scale-125'
                  : 'bg-[#FF6B4A]/20 blur-sm scale-100'
              }`}
            />

            {/* Play Button Core */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ease-out border text-[#0A0A0A] bg-[#FF6B4A] border-[#FF8566] shadow-[0_0_30px_rgba(255,107,74,0.6)] ${
                isHovered ? 'scale-110 bg-[#FF8566]' : 'scale-100'
              }`}
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5 transition-transform group-hover/btn:scale-110" />
            </div>
          </div>
        </div>

        {/* Bottom Banner: Showreel Details & Audio Metadata */}
        <div className="absolute bottom-6 inset-x-4 sm:inset-x-5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF6B4A] font-bold drop-shadow">
              DIRECTOR YASHU
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight drop-shadow-md">
              2026 Master Showreel
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300">
              <Volume2 className="w-3 h-3 text-[#FF6B4A]" />
              <span className="hidden sm:inline">DOLBY ATMOS 7.1</span>
              <span className="sm:hidden">7.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
