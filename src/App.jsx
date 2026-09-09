import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AmbientBackground from './components/common/AmbientBackground';

// Public Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ProjectDetails from './pages/ProjectDetails';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManageVideos from './pages/admin/AdminManageVideos';
import AdminProjectForm from './pages/admin/AdminProjectForm';

// Layout wrapper to hide Navbar/Footer on specific screens if needed
function Layout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';

  return (
    <div className="flex flex-col min-h-screen w-full relative bg-white dark:bg-[#0A0A0A] text-[#171717] dark:text-[#FAFAFA] font-sans antialiased transition-colors duration-500 selection:bg-[#FF6B4A] selection:text-[#0A0A0A]">
      <AmbientBackground />
      {!isLoginPage && <Navbar />}
      <main className="flex-1 relative z-10 w-full bg-transparent">{children}</main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/manage"
                  element={
                    <ProtectedRoute>
                      <AdminManageVideos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/new"
                  element={
                    <ProtectedRoute>
                      <AdminProjectForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/edit/:id"
                  element={
                    <ProtectedRoute>
                      <AdminProjectForm />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
