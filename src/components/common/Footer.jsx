import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ArrowUp, Shield, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TwitterIcon, LinkedinIcon } from './SocialIcons';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#F5F5F5]/85 dark:bg-[#0A0A0A]/85 backdrop-blur-md border-t border-[#E5E5E5] dark:border-[#262626] pt-16 pb-12 relative z-10 overflow-hidden transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E5E5E5] dark:border-[#262626]">
          {/* Column 1: Brand Wordmark & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 inline-flex group focus:outline-none">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B4A] flex items-center justify-center text-[#0A0A0A] shadow-[0_0_15px_rgba(255,107,74,0.35)] transition-transform duration-300 group-hover:scale-105">
                <Film className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-[#171717] dark:text-[#FAFAFA]">
                  FrameVerse
                </span>
                <span className="text-[#FF6B4A] font-black text-xl leading-none ml-0.5 drop-shadow-[0_0_8px_#ff6b4a]">.</span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] max-w-md leading-relaxed font-light">
              Crafting cinematic narratives, high-impact commercials, and immersive visual experiences for global brands, record labels, and forward-thinking studios.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://youtube.com/@antony__memes?si=YI78q4_SqXWgUmqA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] hover:text-red-500 border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                aria-label="YouTube channel"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/yashu._jammula_?stkn=MWRuNGdjM2tnZDBmcw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                aria-label="Instagram profile"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com/yashu_directs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                aria-label="X Twitter profile"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/yashovardhan-jammula-57aa63372"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                aria-label="LinkedIn profile"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://wa.me/917396354633?text=Hi%20Yashu,%20I%20am%20interested%20in%20discussing%20a%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] hover:text-emerald-500 border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                title="Chat with Yashu on WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#171717] dark:text-[#FAFAFA] font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/" className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors">
                  // Home Showcase
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors">
                  // Portfolio Archive
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors">
                  // Commission Work
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] flex items-center gap-1 transition-colors">
                  <Shield className="w-3 h-3 text-[#FF6B4A]" /> Admin Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio Coordinates */}
          <div>
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#171717] dark:text-[#FAFAFA] font-semibold mb-4">
              Coordinates
            </h4>
            <div className="space-y-3 text-xs text-[#737373] dark:text-[#A3A3A3]">
              <p className="text-[#171717] dark:text-[#FAFAFA] font-semibold font-mono">
                Director: Yashu
              </p>

              <div className="flex items-start gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0 mt-0.5" />
                <a
                  href="mailto:contact@frameverse.studio"
                  className="hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] hover:underline transition-colors"
                >
                  contact@frameverse.studio
                </a>
              </div>

              <div className="flex items-start gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <a
                    href="tel:7396354633"
                    className="hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] hover:underline transition-colors"
                  >
                    +91 7396354633
                  </a>
                  <a
                    href="https://wa.me/917396354633?text=Hi%20Yashu,%20I'd%20like%20to%20discuss%20a%20project"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <MessageCircle className="w-2.5 h-2.5" /> WhatsApp Direct
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Medikonduru, Guntur, AP, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#737373] dark:text-[#A3A3A3]">
          <p>© {new Date().getFullYear()} FrameVerse. Directed by Yashu. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-[#737373] dark:text-[#A3A3A3]">
              ACEScct • 4K UHD • Cooke Anamorphic
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#171717] dark:text-[#FAFAFA] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors group"
            >
              Back to Top
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 text-[#FF6B4A]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
