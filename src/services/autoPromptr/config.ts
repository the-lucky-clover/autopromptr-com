// Configuration - Migrated to Lovable Cloud (Supabase Edge Functions)
// Legacy backend URLs kept for reference but no longer used
export const USE_LOVABLE_CLOUD = true;

// Lovable Cloud uses Supabase Edge Functions - no external backend URL needed
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://raahpoyciwuyhwlcenpy.supabase.co';

// Backend Mode Selection
export const BACKEND_MODE = 'lovable-cloud'; // Options: 'lovable-cloud' | 'legacy-render'

// Legacy configuration (deprecated - kept for migration compatibility)
export const LEGACY_BACKEND_URL = localStorage.getItem('autopromptr_backend_url') || '';
export const API_BASE_URL = LEGACY_BACKEND_URL; // Alias for backwards compatibility
export const FALLBACK_URLS = [
  'https://autopromptr-backend.onrender.com',
  'https://autopromptr-api.herokuapp.com'
];
