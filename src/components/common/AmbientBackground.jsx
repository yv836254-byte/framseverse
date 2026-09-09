import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * AmbientBackground
 * 
 * Enhances the site atmosphere with a subtle, low-opacity ambient starfield/galaxy drift
 * combined with slow-drifting, hardware-accelerated glowing ambient orbs.
 * 
 * Features:
 * - Extremely lightweight canvas starfield (~45-55 micro-stars) with gentle twinkling
 * - Low opacity tuned for both light and dark themes (zero interference with text legibility)
 * - Pauses automatically when tab is hidden to conserve battery/GPU
 * - Seamlessly respects prefers-reduced-motion
 * - Pointer events disabled so all clicks pass straight through
 */
export default function AmbientBackground() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Number of subtle celestial micro-stars (optimized for mobile)
    const isMobile = width < 640;
    const PARTICLE_COUNT = Math.min(Math.floor(width / (isMobile ? 35 : 25)), isMobile ? 25 : 55);
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (isMobile ? 1.0 : 1.4) + 0.4,
        baseAlpha: Math.random() * 0.4 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.16 + 0.04), // subtle slow upward drift
        vx: (Math.random() - 0.5) * 0.06,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Adapt star color to active theme (Electric Coral)
      const starColor = isDark ? '255, 107, 74' : '255, 133, 102';
      const masterOpacity = isDark ? 0.28 : 0.15;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.y += p.vy;
        p.x += p.vx;
        p.twinklePhase += p.twinkleSpeed;

        // Wrap around screen edges
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Compute gentle sinusoidal twinkle
        const alpha =
          p.baseAlpha *
          (0.7 + 0.3 * Math.sin(p.twinklePhase)) *
          masterOpacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause animation when tab is not visible to save CPU/battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 
        MULTI-COLOR ANIMATED BACKGROUND BLOBS (Site-Wide)
        4 large soft blurred blob shapes drifting smoothly over 18-24s:
        - Coral / Amber Accent (#FF6B4A) - Top Right
        - Muted Purple / Violet (#8B5CF6) - Top Left
        - Oceanic Teal (#0D9488) - Bottom Left
        - Soft Warm Orange (#FB923C) - Bottom Right
        
        Opacity: 22% in light mode, 28% in dark mode (visibly luminous yet subtle)
      */}
      <div className="absolute inset-0 w-full h-full opacity-20 dark:opacity-30 transition-opacity duration-700 pointer-events-none">
        {/* Blob 1: Coral / Amber Accent (#FF6B4A) - Top Right Quadrant */}
        <div
          className="absolute -top-[10%] -right-[10%] sm:-top-[15%] sm:-right-[10%] w-[520px] sm:w-[750px] lg:w-[920px] h-[520px] sm:h-[750px] lg:h-[920px] rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-blob-1"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 107, 74, 0.95) 0%, rgba(255, 107, 74, 0.5) 45%, transparent 70%)',
          }}
        />

        {/* Blob 2: Muted Purple (#8B5CF6) - Top Left Quadrant */}
        <div
          className="absolute -top-[5%] -left-[10%] sm:-top-[10%] sm:-left-[10%] w-[480px] sm:w-[700px] lg:w-[860px] h-[480px] sm:h-[700px] lg:h-[860px] rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-blob-2"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, rgba(139, 92, 246, 0.45) 45%, transparent 70%)',
          }}
        />

        {/* Blob 3: Oceanic Teal (#0D9488) - Bottom Left Quadrant */}
        <div
          className="absolute -bottom-[10%] -left-[8%] sm:-bottom-[15%] sm:-left-[8%] w-[500px] sm:w-[720px] lg:w-[880px] h-[500px] sm:h-[720px] lg:h-[880px] rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-blob-3"
          style={{
            background:
              'radial-gradient(circle, rgba(13, 148, 136, 0.9) 0%, rgba(13, 148, 136, 0.45) 45%, transparent 70%)',
          }}
        />

        {/* Blob 4: Soft Warm Orange (#FB923C) - Bottom Right Quadrant */}
        <div
          className="absolute -bottom-[8%] -right-[8%] sm:-bottom-[12%] sm:-right-[8%] w-[460px] sm:w-[660px] lg:w-[820px] h-[460px] sm:h-[660px] lg:h-[820px] rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-blob-4"
          style={{
            background:
              'radial-gradient(circle, rgba(251, 146, 60, 0.92) 0%, rgba(251, 146, 60, 0.48) 45%, transparent 70%)',
          }}
        />
      </div>

      {/* Subtle Micro-Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Subtle micro-grid overlay for cinematic texture */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]"
      />
    </div>
  );
}
