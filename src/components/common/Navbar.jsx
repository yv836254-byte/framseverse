import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Menu, X, Shield, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change or resize
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled || mobileMenuOpen
            ? 'bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626] shadow-sm dark:shadow-2xl py-3 sm:py-3.5'
            : 'bg-gradient-to-b from-white/95 via-white/60 to-transparent dark:from-[#0A0A0A]/90 dark:via-[#0A0A0A]/40 dark:to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark - FrameVerse with Electric Coral dot */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A] text-[#0A0A0A] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(255,107,74,0.4)]">
              <Film className="w-4 h-4 text-[#0A0A0A] transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#171717] dark:text-[#FAFAFA] font-sans">
                FrameVerse
              </span>
              <span className="text-[#FF6B4A] font-black text-lg sm:text-xl leading-none ml-0.5 drop-shadow-[0_0_8px_#ff6b4a]">.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#171717] p-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] backdrop-blur-md">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 relative ${
                    active
                      ? 'bg-[#FF6B4A] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(255,107,74,0.35)]'
                      : 'text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions: Status Badge, Theme Toggle & Admin Link */}
          <div className="hidden md:flex items-center gap-3">
            {/* Studio Booking Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#737373] dark:text-[#A3A3A3]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF6B4A] shadow-[0_0_8px_#ff6b4a]"></span>
              </span>
              <span>Available for 2026</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[#F5F5F5] hover:bg-[#EEEEEE] dark:bg-[#171717] dark:hover:bg-[#262626] border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-all duration-200 shadow-sm"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FF6B4A]" /> : <Moon className="w-4 h-4 text-[#171717]" />}
            </button>

            {/* Admin link / Status */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F5] dark:bg-[#171717] hover:border-[#FF6B4A]/50 text-xs font-semibold text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] transition-colors"
                  title="Director Admin Studio"
                >
                  <Shield className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="p-2 rounded-full text-neutral-400 hover:text-[#FF6B4A] transition-colors"
                title="Admin Portal"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile menu actions: Theme Toggle + Animated Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] text-[#171717] dark:text-[#FAFAFA] border border-[#E5E5E5] dark:border-[#262626] active:scale-95 transition-transform"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FF6B4A]" /> : <Moon className="w-4 h-4 text-[#171717]" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] text-[#171717] dark:text-[#FAFAFA] border border-[#E5E5E5] dark:border-[#262626] active:scale-95 transition-transform"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#FF6B4A] animate-in spin-in-90 duration-200" />
              ) : (
                <Menu className="w-5 h-5 animate-in fade-in duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/98 dark:bg-[#0A0A0A]/98 border-t border-[#E5E5E5] dark:border-[#262626] px-4 py-5 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                    isActive(link.path)
                      ? 'bg-[#FF6B4A] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(255,107,74,0.35)]'
                      : 'text-[#737373] dark:text-[#A3A3A3] hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive(link.path) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                  )}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#737373] dark:text-[#A3A3A3]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4A] shadow-[0_0_8px_#ff6b4a]"></span>
                  <span>Available for 2026</span>
                </div>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-semibold text-[#FF6B4A] hover:underline"
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-mono text-[#737373] hover:text-[#FF6B4A]"
                  >
                    Admin Access →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop Click Catcher */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}
    </>
  );
}
