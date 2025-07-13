
// Configuration - Updated for Cloudflare Pages deployment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://autopromptr-backend.onrender.com'
    : localStorage.getItem('autopromptr_backend_url') || 'https://autopromptr-backend.onrender.com');

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://raahpoyciwuyhwlcenpy.supabase.co';

// Fallback URLs for better connection reliability
export const FALLBACK_URLS = [
  'https://autopromptr-backend.onrender.com',
  'https://autopromptr-api.herokuapp.com',
  'http://localhost:3000'
];
