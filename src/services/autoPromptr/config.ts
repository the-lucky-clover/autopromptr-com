
// Configuration - Updated with fallback URLs for better reliability
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://autopromptr-backend.onrender.com'
  : localStorage.getItem('autopromptr_backend_url') || 'https://autopromptr-backend.onrender.com';

export const SUPABASE_URL = 'https://raahpoyciwuyhwlcenpy.supabase.co';

// Fallback URLs for better connection reliability
export const FALLBACK_URLS = [
  'https://autopromptr-backend.onrender.com',
  'https://autopromptr-api.herokuapp.com',
  'http://localhost:3000'
];
