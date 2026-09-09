import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Eye,
  Plus,
  Layers,
  TrendingUp,
  ExternalLink,
  Edit,
  Trash2,
  AlertTriangle,
  RotateCcw,
  FileVideo,
  LogOut
} from 'lucide-react';
import { projectService } from '../../lib/supabase';
import { formatViews, formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const { signOut } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects({ sortBy: 'newest' });
      setProjects(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Compute metrics
  const totalProjects = projects.length;
  const totalViews = projects.reduce((acc, p) => acc + (Number(p.views) || 0), 0);
  const mostViewedProject = [...projects].sort(
    (a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)
  )[0];

  // Category counts
  const categoryMap = projects.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await projectService.deleteProject(projectToDelete.id);
      showToast(`Deleted "${projectToDelete.title}" successfully`, 'success');
      setProjectToDelete(null);
      await loadProjects();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete project', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo projects back to the initial 8 showcase items?')) {
      projectService.resetToInitial();
      loadProjects();
      showToast('Reset data to initial showcase projects!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 transition-colors duration-500 font-sans">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#FF6B4A] font-semibold block">
            FrameVerse • Super Admin Console
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight mt-1">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mt-1 font-light">
            Logged in as <strong>Director Yashu</strong>. Monitor showcase engagement, upload video files, and manage client case studies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            className="p-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] transition-colors shadow-sm"
            title="Reset to Initial Dummy Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/manage"
            className="px-4 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] text-xs font-mono font-semibold text-[#171717] dark:text-[#FAFAFA] border border-[#E5E5E5] dark:border-[#262626] hover:border-[#FF6B4A]/50 transition-colors shadow-sm"
          >
            Manage All
          </Link>

          <Link
            to="/admin/new"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Video</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              signOut();
              showToast('Signed out of FrameVerse Admin', 'info');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition-colors"
            title="Sign Out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Videos */}
        <div className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] font-semibold">
              Total Videos
            </span>
            <div className="p-2 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/25">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">
            {loading ? '...' : totalProjects}
          </div>
          <span className="text-xs text-[#737373] dark:text-[#A3A3A3] block font-light">Cataloged portfolio projects</span>
        </div>

        {/* Total Views */}
        <div className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] font-semibold">
              Total Showcase Views
            </span>
            <div className="p-2 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/25">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">
            {loading ? '...' : formatViews(totalViews)}
          </div>
          <span className="text-xs text-[#FF6B4A] block font-mono">Cumulative impressions</span>
        </div>

        {/* Most Viewed Video */}
        <div className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] font-semibold">
              Top Performer
            </span>
            <div className="p-2 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/25">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-[#171717] dark:text-[#FAFAFA] line-clamp-1">
            {loading ? '...' : mostViewedProject?.title || 'None'}
          </div>
          <span className="text-xs text-[#FF6B4A] block font-mono">
            {mostViewedProject ? `${formatViews(mostViewedProject.views)} views` : '-'}
          </span>
        </div>

        {/* Categories Breakdown */}
        <div className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] font-semibold">
              Active Categories
            </span>
            <div className="p-2 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/25">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#171717] dark:text-[#FAFAFA] font-mono">
            {Object.keys(categoryMap).length}
          </div>
          <span className="text-xs text-[#737373] dark:text-[#A3A3A3] block font-light">Commercials, films & VFX</span>
        </div>
      </div>

      {/* Category breakdown bar */}
      <div className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-3 shadow-sm">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] font-semibold">
          Distribution by Category
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(categoryMap).map(([cat, count]) => (
            <div
              key={cat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-xs shadow-sm font-mono"
            >
              <span className="text-[#171717] dark:text-[#FAFAFA] font-medium">{cat}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FF6B4A]/15 text-[#FF6B4A] font-mono text-[10px] font-bold">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
            Recent Projects Catalog
          </h2>
          <Link
            to="/admin/manage"
            className="text-xs font-mono text-[#FF6B4A] hover:underline"
          >
            View full management table ({projects.length})
          </Link>
        </div>

        <div className="rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#171717] dark:text-[#FAFAFA]">
              <thead className="bg-[#E5E5E5]/50 dark:bg-[#262626]/50 text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] border-b border-[#E5E5E5] dark:border-[#262626]">
                <tr>
                  <th scope="col" className="px-6 py-4">Project</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Views</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[#737373] dark:text-[#A3A3A3] font-mono text-xs">
                      Loading projects catalog...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[#737373] dark:text-[#A3A3A3] font-mono text-xs">
                      No projects currently available. Click "Add New Video" to get started!
                    </td>
                  </tr>
                ) : (
                  projects.slice(0, 6).map((proj) => {
                    const isUploaded =
                      proj.video_type === 'upload' ||
                      (proj.video_url && !proj.video_url.includes('youtube') && !proj.video_url.includes('youtu.be'));

                    return (
                      <tr key={proj.id} className="hover:bg-black/05 dark:hover:bg-white/05 transition-colors">
                        {/* Project info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={proj.thumbnail_url}
                              alt={proj.title}
                              className="w-16 h-10 rounded-lg object-cover bg-zinc-900 shrink-0 border border-[#E5E5E5] dark:border-[#262626]"
                            />
                            <div className="overflow-hidden">
                              <span className="font-semibold text-[#171717] dark:text-[#FAFAFA] block line-clamp-1">
                                {proj.title}
                              </span>
                              <span className="text-xs text-[#737373] dark:text-[#A3A3A3] block line-clamp-1 font-mono">
                                {proj.client || 'Personal Project'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Video type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                            isUploaded
                              ? 'bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30'
                              : 'bg-white dark:bg-[#0A0A0A] text-[#737373] dark:text-[#A3A3A3] border border-[#E5E5E5] dark:border-[#262626]'
                          }`}>
                            {isUploaded ? <FileVideo className="w-3 h-3 text-[#FF6B4A]" /> : <Film className="w-3 h-3 text-slate-400" />}
                            <span>{isUploaded ? 'Upload' : 'YouTube'}</span>
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-[#A3A3A3]">
                            {proj.category}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-6 py-4 font-mono text-xs text-[#737373] dark:text-[#A3A3A3]">
                          {formatViews(proj.views)}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs font-mono text-[#737373] dark:text-[#A3A3A3]">
                          {formatDate(proj.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/project/${proj.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-black/05 dark:hover:bg-white/05 transition-colors"
                              title="View Live Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/admin/edit/${proj.id}`}
                              className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] hover:bg-black/05 dark:hover:bg-white/05 transition-colors"
                              title="Edit Project"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setProjectToDelete(proj)}
                              className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-rose-500 hover:bg-black/05 dark:hover:bg-white/05 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Project Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p>
              Permanently delete{' '}
              <strong>"{projectToDelete?.title}"</strong>? This will remove the case study and video link from FrameVerse.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setProjectToDelete(null)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono font-semibold text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#FAFAFA]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-mono font-semibold text-white shadow-md transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
