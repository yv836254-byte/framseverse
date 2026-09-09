import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname;
  const targetDestination = from && from !== '/admin/login' ? from : '/admin/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = 'Please enter both email and password.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      setLoading(true);
      await signIn(cleanEmail, password);
      showToast('Authenticated successfully.', 'success');
      navigate(targetDestination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = 'Invalid email or password. Access denied.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6B4A]" /> // Return to Portfolio
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A] text-[#0A0A0A] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,107,74,0.4)]">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
            FrameVerse Admin Studio
          </h2>
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono">
            Authenticated administrative console for portfolio management.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 relative">
        {/* Multi-color subtle ambient halo */}
        <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-r from-[#FF6B4A]/20 via-[#8B5CF6]/15 to-[#0D9488]/20 blur-xl opacity-70 pointer-events-none" />

        <div className="relative p-8 rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block mb-1.5 font-semibold">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                  <Mail className="w-4 h-4 text-[#FF6B4A]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                  <Lock className="w-4 h-4 text-[#FF6B4A]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Studio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
