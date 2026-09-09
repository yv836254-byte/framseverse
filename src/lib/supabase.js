import { createClient } from '@supabase/supabase-js';
import { INITIAL_PROJECTS } from './projectsData';
import { saveVideoBlob, resolvePlaybackUrl } from './videoStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are properly set
export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Create real client or dummy client to prevent instantiation crashes
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = 'frameverse_projects_v3';

// Local storage fallback management
function getLocalProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return [...INITIAL_PROJECTS];
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn('Failed reading localStorage, using default initial data', err);
    return [...INITIAL_PROJECTS];
  }
}

function setLocalProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed saving to localStorage', err);
  }
}

/**
 * Unified project data service that seamlessly toggles between
 * Supabase cloud and responsive local storage fallback.
 */
export const projectService = {
  /**
   * Fetch all projects with optional filtering and sorting
   */
  async getProjects({ category = 'All', search = '', sortBy = 'newest' } = {}) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('projects').select('*');

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }

        if (search) {
          query = query.ilike('title', `%${search}%`);
        }

        if (sortBy === 'most_viewed') {
          query = query.order('views', { ascending: false });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        const items = data || [];
        for (const p of items) {
          if (p.video_url && (p.video_url.startsWith('indexeddb://') || p.video_url.startsWith('blob:'))) {
            p.video_url = await resolvePlaybackUrl(p.video_url);
          }
        }
        return items;
      } catch (err) {
        console.warn('Supabase getProjects error, falling back to local storage:', err.message);
      }
    }

    // Fallback: Local data
    let list = getLocalProjects();

    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.client && p.client.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'most_viewed') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    for (const p of list) {
      if (p.video_url && (p.video_url.startsWith('indexeddb://') || p.video_url.startsWith('blob:'))) {
        p.video_url = await resolvePlaybackUrl(p.video_url);
      }
    }

    return list;
  },

  /**
   * Fetch single project by ID
   */
  async getProjectById(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data && data.video_url && (data.video_url.startsWith('indexeddb://') || data.video_url.startsWith('blob:'))) {
          data.video_url = await resolvePlaybackUrl(data.video_url);
        }
        return data;
      } catch (err) {
        console.warn('Supabase getProjectById error, falling back to local data:', err.message);
      }
    }

    const list = getLocalProjects();
    const found = list.find(p => String(p.id) === String(id));
    if (!found) {
      throw new Error('Project not found');
    }
    if (found.video_url && (found.video_url.startsWith('indexeddb://') || found.video_url.startsWith('blob:'))) {
      found.video_url = await resolvePlaybackUrl(found.video_url);
    }
    return found;
  },

  /**
   * Create a new project
   */
  async createProject(projectData) {
    const videoType = projectData.video_type || 
      (projectData.video_url?.includes('youtube') || projectData.video_url?.includes('youtu.be') ? 'youtube' : 'upload');

    const payload = {
      ...projectData,
      video_type: videoType,
      created_at: new Date().toISOString(),
      views: Number(projectData.views) || 0,
      tags: Array.isArray(projectData.tags) ? projectData.tags : [],
      technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase createProject error, falling back to local data:', err.message);
      }
    }

    const list = getLocalProjects();
    const newProject = {
      ...payload,
      id: String(Date.now()),
    };
    list.unshift(newProject);
    setLocalProjects(list);
    return newProject;
  },

  /**
   * Update an existing project
   */
  async updateProject(id, updates) {
    const cleanUpdates = {
      ...updates,
      tags: Array.isArray(updates.tags) ? updates.tags : [],
      technologies: Array.isArray(updates.technologies) ? updates.technologies : [],
    };

    if (cleanUpdates.video_url && !cleanUpdates.video_type) {
      cleanUpdates.video_type = 
        cleanUpdates.video_url.includes('youtube') || cleanUpdates.video_url.includes('youtu.be') ? 'youtube' : 'upload';
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateProject error, falling back to local data:', err.message);
      }
    }

    const list = getLocalProjects();
    const index = list.findIndex(p => String(p.id) === String(id));
    if (index === -1) {
      throw new Error('Project not found');
    }

    list[index] = { ...list[index], ...cleanUpdates };
    setLocalProjects(list);
    return list[index];
  },

  /**
   * Delete a project
   */
  async deleteProject(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase deleteProject error, falling back to local data:', err.message);
      }
    }

    const list = getLocalProjects();
    const filtered = list.filter(p => String(p.id) !== String(id));
    setLocalProjects(filtered);
    return true;
  },

  /**
   * Increment view count for a project
   */
  async incrementViews(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        // Try calling custom RPC function first
        const { data, error } = await supabase.rpc('increment_views', { project_id: id });
        if (!error) return data;

        // Fallback to fetch and update if RPC not present
        const current = await this.getProjectById(id);
        if (current) {
          const newViews = (current.views || 0) + 1;
          await supabase.from('projects').update({ views: newViews }).eq('id', id);
          return newViews;
        }
      } catch (err) {
        console.warn('Supabase incrementViews error, updating locally:', err.message);
      }
    }

    const list = getLocalProjects();
    const target = list.find(p => String(p.id) === String(id));
    if (target) {
      target.views = (target.views || 0) + 1;
      setLocalProjects(list);
      return target.views;
    }
    return 0;
  },

  /**
   * Upload thumbnail image to Supabase Storage or convert to DataURL in fallback
   */
  async uploadThumbnail(file) {
    if (!file) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-thumbnails')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('project-thumbnails')
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (err) {
        console.warn('Supabase thumbnail upload error, falling back to local data URL:', err.message);
      }
    }

    // Fallback: convert file to Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload actual video file to Supabase Storage bucket 'project-videos'
   * or store persistently in IndexedDB in fallback mode
   */
  async uploadVideoFile(file) {
    if (!file) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `videos/${Date.now()}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-videos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('project-videos')
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          // Also save in local IndexedDB as background resilience cache
          saveVideoBlob(file).catch(() => {});
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase video upload error, falling back to persistent IndexedDB storage:', err.message);
      }
    }

    // Fallback: store file persistently in IndexedDB so it survives page refreshes
    return await saveVideoBlob(file);
  },

  /**
   * Reset local storage data to initial seed data
   */
  resetToInitial() {
    setLocalProjects(INITIAL_PROJECTS);
    return [...INITIAL_PROJECTS];
  }
};
