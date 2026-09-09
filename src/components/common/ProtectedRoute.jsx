import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center gap-3 transition-colors duration-500">
        <Loader2 className="w-8 h-8 text-[#FF6B4A] animate-spin" />
        <span className="text-[10px] tracking-widest uppercase text-[#737373] dark:text-[#A3A3A3] font-mono">
          Authenticating Studio Portal...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
