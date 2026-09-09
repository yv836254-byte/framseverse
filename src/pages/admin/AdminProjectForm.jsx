import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  FileVideo
} from 'lucide-react';
import { YoutubeIcon } from '../../components/common/SocialIcons';
import { projectService } from '../../lib/supabase';
import { resolvePlaybackUrl } from '../../lib/videoStorage';
import { CATEGORIES } from '../../lib/projectsData';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, parseTags } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import VideoPlayer from '../../components/common/VideoPlayer';

export default function AdminProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [activePreviewVideoUrl, setActivePreviewVideoUrl] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    category: 'Commercial',
    video_type: 'youtube', // 'youtube' or 'upload'
    video_url: '',
    thumbnail_url: '',
    description: '',
    client: '',
    role: '',
    duration: '',
    views: 0,
    tags: '',
    technologies: '',
    featured: false,
  });

  // Load project if in edit mode
  useEffect(() => {
    if (isEditing) {
      async function loadProjectData() {
        try {
          setLoading(true);
          const project = await projectService.getProjectById(id);
          const isUploaded =
            project.video_type === 'upload' ||
            (project.video_url && !project.video_url.includes('youtube') && !project.video_url.includes('youtu.be'));

          setFormData({
            title: project.title || '',
            category: project.category || 'Commercial',
            video_type: isUploaded ? 'upload' : 'youtube',
            video_url: project.video_url || '',
            thumbnail_url: project.thumbnail_url || '',
            description: project.description || '',
            client: project.client || '',
            role: project.role || '',
            duration: project.duration || '',
            views: project.views || 0,
            tags: parseTags(project.tags).join(', '),
            technologies: parseTags(project.technologies).join(', '),
            featured: Boolean(project.featured),
          });
        } catch (err) {
          console.error('Failed to load project for editing:', err);
          showToast('Failed to load project details', 'error');
          navigate('/admin/manage');
        } finally {
          setLoading(false);
        }
      }
      loadProjectData();
    }
  }, [id, isEditing, navigate, showToast]);

  // Keep active preview video URL updated for uploaded videos
  useEffect(() => {
    let isCancelled = false;
    if (formData.video_type === 'upload' && formData.video_url) {
      resolvePlaybackUrl(formData.video_url).then((url) => {
        if (!isCancelled) setActivePreviewVideoUrl(url);
      });
    } else {
      setActivePreviewVideoUrl('');
    }
    return () => {
      isCancelled = true;
    };
  }, [formData.video_type, formData.video_url]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Project title is required';
    if (!formData.category) errs.category = 'Please select a category';
    if (!formData.video_url.trim()) {
      errs.video_url = formData.video_type === 'upload'
        ? 'Please upload a video file or provide a video URL'
        : 'YouTube video URL is required';
    } else if (formData.video_type === 'youtube' && !getYouTubeEmbedUrl(formData.video_url)) {
      errs.video_url = 'Please provide a valid YouTube URL (watch, share, or embed)';
    }
    if (!formData.description.trim()) {
      errs.description = 'Project narrative/description is required';
    }
    return errs;
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    try {
      setUploadingThumb(true);
      const uploadedUrl = await projectService.uploadThumbnail(file);
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, thumbnail_url: uploadedUrl }));
        showToast('Thumbnail uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to upload thumbnail', 'error');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4, WebM, MOV)', 'error');
      return;
    }

    try {
      setUploadingVideo(true);
      showToast('Uploading video file to storage...', 'info');
      const uploadedUrl = await projectService.uploadVideoFile(file);
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          video_type: 'upload',
          video_url: uploadedUrl,
        }));
        showToast('Video uploaded and playback verified!', 'success');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      showToast('Failed to upload video file', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('Please correct form errors before saving', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      video_type: formData.video_type,
      video_url: formData.video_url.trim(),
      thumbnail_url: formData.thumbnail_url.trim() || (formData.video_type === 'youtube' ? getYouTubeThumbnail(formData.video_url) : ''),
      description: formData.description.trim(),
      client: formData.client.trim(),
      role: formData.role.trim(),
      duration: formData.duration.trim(),
      views: Number(formData.views) || 0,
      tags: parseTags(formData.tags),
      technologies: parseTags(formData.technologies),
      featured: formData.featured,
    };

    try {
      setSaving(true);
      if (isEditing) {
        await projectService.updateProject(id, payload);
        showToast('Project updated successfully in FrameVerse!', 'success');
      } else {
        await projectService.createProject(payload);
        showToast('Project published to FrameVerse showcase!', 'success');
      }
      navigate('/admin/manage');
    } catch (err) {
      console.error('Save error:', err);
      showToast(`Error: ${err.message || 'Failed to save project'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const liveEmbedUrl = formData.video_type === 'youtube' ? getYouTubeEmbedUrl(formData.video_url) : '';
  const previewThumb =
    formData.thumbnail_url || (formData.video_type === 'youtube' && formData.video_url ? getYouTubeThumbnail(formData.video_url) : '');

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-32 pb-24 px-4 text-center font-mono text-xs">
        <p className="text-slate-400">Loading project editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 transition-colors duration-500 font-sans">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div>
          <Link
            to="/admin/manage"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B4A]" /> // Return to Projects
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight">
            {isEditing ? `Edit: ${formData.title || 'Project'}` : 'Publish New Video Project'}
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mt-1 font-light">
            Configure video playback (self-uploaded or YouTube), metadata, thumbnail, and case study details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs font-mono transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Project'}</span>
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] shadow-sm space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Project Title <span className="text-[#FF6B4A]">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. HYPERION: Chrono Velocity"
                className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 ${
                  errors.title ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Category and Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Category <span className="text-[#FF6B4A]">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0A] text-xs font-mono text-[#171717] dark:text-[#FAFAFA] border border-[#E5E5E5] dark:border-[#262626] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-[#E5E5E5] dark:border-[#262626] text-[#FF6B4A] focus:ring-[#FF6B4A]"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#171717] dark:text-[#FAFAFA]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>Highlight as Featured Showcase</span>
                  </div>
                </label>
              </div>
            </div>

            {/* VIDEO SOURCE TYPE SELECTOR */}
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Video Playback Source <span className="text-[#FF6B4A]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, video_type: 'upload' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-mono font-semibold transition-all ${
                    formData.video_type === 'upload'
                      ? 'bg-[#FF6B4A] text-[#0A0A0A] border-[#FF6B4A] font-bold shadow-coral'
                      : 'bg-white dark:bg-[#0A0A0A] border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:border-[#FF6B4A]/50'
                  }`}
                >
                  <FileVideo className="w-4 h-4" />
                  <span>Upload Video File (HTML5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, video_type: 'youtube' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-mono font-semibold transition-all ${
                    formData.video_type === 'youtube'
                      ? 'bg-[#FF6B4A] text-[#0A0A0A] border-[#FF6B4A] font-bold shadow-coral'
                      : 'bg-white dark:bg-[#0A0A0A] border-[#E5E5E5] dark:border-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:border-[#FF6B4A]/50'
                  }`}
                >
                  <YoutubeIcon className="w-4 h-4 text-red-500" />
                  <span>YouTube Link</span>
                </button>
              </div>

              {/* Upload Video Section */}
              {formData.video_type === 'upload' ? (
                <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626]">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1 px-4 py-3 rounded-xl border-2 border-dashed border-[#E5E5E5] dark:border-[#262626] hover:border-[#FF6B4A] text-center cursor-pointer bg-[#F5F5F5] dark:bg-[#171717] transition-colors flex flex-col items-center justify-center gap-1.5">
                      <Upload className="w-5 h-5 text-[#FF6B4A]" />
                      <span className="text-xs font-mono font-semibold text-[#171717] dark:text-[#FAFAFA]">
                        {uploadingVideo ? 'Uploading Video File...' : 'Choose MP4, WebM, or MOV file'}
                      </span>
                      <span className="text-[10px] font-mono text-[#737373] dark:text-[#A3A3A3]">
                        Uploads directly to Supabase Storage
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                        disabled={uploadingVideo}
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#737373] dark:text-[#A3A3A3] block">
                      Or paste a direct URL to a video file (.mp4 / .webm):
                    </span>
                    <input
                      type="text"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://your-domain.com/videos/reel.mp4"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0A0A0A] text-xs font-mono text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] border border-[#E5E5E5] dark:border-[#262626] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                    />
                  </div>
                </div>
              ) : (
                /* YouTube Link Section */
                <div className="space-y-1.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                      <Video className="w-4 h-4 text-[#FF6B4A]" />
                    </div>
                    <input
                      type="text"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=ScMzIvxBSi4 or youtu.be/..."
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 ${
                        errors.video_url ? 'border-rose-500 ring-1 ring-rose-500' : ''
                      }`}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-[#737373] dark:text-[#A3A3A3]">
                    Supports standard watch links, share links, and embed formats.
                  </p>
                </div>
              )}

              {errors.video_url && (
                <p className="text-xs text-rose-500 flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3 h-3" /> {errors.video_url}
                </p>
              )}
            </div>

            {/* Thumbnail Upload or URL */}
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Thumbnail Cover Visual
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                    <ImageIcon className="w-4 h-4 text-[#FF6B4A]" />
                  </div>
                  <input
                    type="text"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="Paste image URL (Unsplash or CDN)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                  />
                </div>

                <label className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono font-semibold text-[#171717] dark:text-[#FAFAFA] flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span>{uploadingThumb ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    disabled={uploadingThumb}
                  />
                </label>
              </div>
            </div>

            {/* Client and Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Client / Commission
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="e.g. Apex Automotive"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Director Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Director & Lead Cinematographer"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                />
              </div>
            </div>

            {/* Duration and Views */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Duration (MM:SS)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 02:45"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                  Initial Views Count
                </label>
                <input
                  type="number"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
                />
              </div>
            </div>

            {/* Production Hardware & Software */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Production Hardware & Software (comma-separated)
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="DaVinci Resolve Studio, RED Komodo, ARRI Mini LF, Cinema 4D"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Project Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Automotive, Color Grading, Anamorphic, VFX"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-xs font-mono text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50"
              />
            </div>

            {/* Description Narrative */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Project Description / Treatment Narrative <span className="text-[#FF6B4A]">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the shooting locations, lighting treatment, narrative theme, and creative goals..."
                className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] resize-none focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/50 ${
                  errors.description ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Transmitting Data...' : isEditing ? 'Save Changes' : 'Publish to FrameVerse'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Card & Player Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-4 sticky top-28 shadow-sm">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] font-semibold">
              Live Embed & Visual Preview
            </h3>

            {/* Video Player Preview */}
            <div
              className="rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] aspect-video relative flex items-center justify-center"
              onContextMenu={(e) => e.preventDefault()}
            >
              {(formData.video_type === 'upload' && (activePreviewVideoUrl || formData.video_url)) ||
              (formData.video_type !== 'upload' && liveEmbedUrl) ? (
                <VideoPlayer
                  videoType={formData.video_type === 'upload' ? 'upload' : 'youtube'}
                  src={
                    formData.video_type === 'upload'
                      ? activePreviewVideoUrl || formData.video_url
                      : formData.video_url
                  }
                  poster={previewThumb}
                  title="Live Preview"
                  className="rounded-2xl"
                />
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <Video className="w-8 h-8 mx-auto text-[#FF6B4A]/60" />
                  <p className="text-xs font-mono">
                    {formData.video_type === 'upload'
                      ? 'Upload a video file to test HTML5 playback'
                      : 'Paste a YouTube link to preview the player'}
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail preview */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Gallery Card Thumbnail
              </span>
              <div className="aspect-video rounded-xl overflow-hidden bg-[#F5F5F5] dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] relative">
                {previewThumb ? (
                  <img
                    src={previewThumb}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                    Thumbnail visual preview
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-sm font-semibold text-[#FF6B4A] border border-white/10">
                  {formData.category}
                </div>
              </div>
            </div>

            {/* Metadata recap */}
            <div className="pt-2 text-xs text-[#737373] dark:text-[#A3A3A3] space-y-1 font-mono">
              <p>
                <strong className="text-[#171717] dark:text-[#FAFAFA] font-sans">{formData.title || 'Untitled Project'}</strong>
              </p>
              <p>
                Type: <span className="font-bold text-[#FF6B4A] uppercase">{formData.video_type}</span> • {formData.client ? `Client: ${formData.client}` : 'Personal Project'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
