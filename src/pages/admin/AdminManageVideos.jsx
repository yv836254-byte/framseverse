import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  FileVideo,
  Film
} from 'lucide-react';
import { projectService } from '../../lib/supabase';
import { formatViews } from '../../lib/utils';
import { CATEGORIES } from '../../lib/projectsData';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

export default function AdminManageVideos() {
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      showToast('Error loading project list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat =
        selectedCat === 'All' || p.category.toLowerCase() === selectedCat.toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(q) ||
        (p.client && p.client.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [projects, selectedCat, search]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await projectService.deleteProject(projectToDelete.id);
      showToast(`Project "${projectToDelete.title}" deleted`, 'success');
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete project', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 transition-colors duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B4A]" /> // Return to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
            Manage Video Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mt-1 font-light">
            Edit metadata, attach video files or YouTube links, and curate the FrameVerse showcase.
          </p>
        </div>

        <Link
          to="/admin/new"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
            <Search className="w-4 h-4 text-[#FF6B4A]" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or client..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-xs sm:text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 shadow-sm"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#171717] text-xs font-mono text-[#171717] dark:text-[#FAFAFA] border border-[#E5E5E5] dark:border-[#262626] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 shadow-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#171717] dark:text-[#FAFAFA]">
            <thead className="bg-[#E5E5E5]/50 dark:bg-[#262626]/50 text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#A3A3A3] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th scope="col" className="px-6 py-4">Title & Client</th>
                <th scope="col" className="px-6 py-4">Source</th>
                <th scope="col" className="px-6 py-4">Category</th>
                <th scope="col" className="px-6 py-4">Duration</th>
                <th scope="col" className="px-6 py-4">Views</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[#737373] dark:text-[#A3A3A3] font-mono text-xs">
                    Loading project catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#737373] dark:text-[#A3A3A3] font-mono text-xs space-y-2">
                    <p>No projects match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((proj) => {
                  const isUploaded =
                    proj.video_type === 'upload' ||
                    (proj.video_url && !proj.video_url.includes('youtube') && !proj.video_url.includes('youtu.be'));

                  return (
                    <tr key={proj.id} className="hover:bg-black/05 dark:hover:bg-white/05 transition-colors">
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

                      {/* Video source badge */}
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

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-[#A3A3A3]">
                          {proj.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#737373] dark:text-[#A3A3A3]">
                        {proj.duration || '-'}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#737373] dark:text-[#A3A3A3]">
                        {formatViews(proj.views)}
                      </td>

                      <td className="px-6 py-4">
                        {proj.featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-[#FF6B4A] text-[#0A0A0A] shadow-sm">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        ) : (
                          <span className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono">Standard</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/project/${proj.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-black/05 dark:hover:bg-white/05 transition-colors"
                            title="View Live"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/edit/${proj.id}`}
                            className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] hover:bg-black/05 dark:hover:bg-white/05 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setProjectToDelete(proj)}
                            className="p-1.5 rounded-lg text-[#737373] dark:text-[#A3A3A3] hover:text-rose-500 hover:bg-black/05 dark:hover:bg-white/05 transition-colors"
                            title="Delete"
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
              Are you sure you want to permanently delete{' '}
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
              onClick={handleDelete}
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
