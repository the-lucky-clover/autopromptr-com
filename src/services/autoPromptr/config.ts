// Configuration - Migrated to Cloudflare Workers
// Legacy backend URLs kept for reference but no longer used
export const USE_CLOUDFLARE = true;

// Cloudflare Worker URL
export const CLOUDFLARE_WORKER_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://autopromptr-worker.autopromptr.workers.dev';

// Backend Mode Selection
export const BACKEND_MODE = 'cloudflare'; // Options: 'cloudflare' | 'legacy-render'

// Legacy configuration (deprecated - kept for migration compatibility)
export const LEGACY_BACKEND_URL = localStorage.getItem('autopromptr_backend_url') || '';
export const API_BASE_URL = LEGACY_BACKEND_URL; // Alias for backwards compatibility
export const FALLBACK_URLS = [
  'https://autopromptr-backend.onrender.com',
  'https://autopromptr-api.herokuapp.com'
];
