
// Cloudflare-specific configuration parallel to existing autoPromptr config
export const CLOUDFLARE_CONFIG = {
  // Cloudflare Pages environment detection
  IS_CLOUDFLARE_PAGES: typeof window !== 'undefined' && window.location.hostname.includes('.pages.dev'),
  
  // Cloudflare Workers API endpoints
  WORKER_BASE_URL: import.meta.env.VITE_CF_WORKER_URL || 
    (import.meta.env.PROD 
      ? 'https://autopromptr-worker.yourdomain.workers.dev'  
      : 'http://localhost:8787'),
  
  // Supabase config for Cloudflare Pages
  CF_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://raahpoyciwuyhwlcenpy.supabase.co',
  CF_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYWhwb3ljaXd1eWh3bGNlbnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Njc4NTAsImV4cCI6MjA2NDU0Mzg1MH0.lAzBUV4PumqVGQqJNhS-5snJIt_qnSAARSYKb5WEUQo',
  
  // Feature flags for gradual migration  
  FEATURES: {
    USE_CF_WORKERS: import.meta.env.VITE_USE_CF_WORKERS === 'true',
    USE_CF_PAGES_ROUTING: import.meta.env.VITE_USE_CF_PAGES_ROUTING === 'true',
    PARALLEL_PROCESSING: import.meta.env.VITE_PARALLEL_PROCESSING === 'true',
  }
};

// Environment detection helper
export const getEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  
  if (window.location.hostname.includes('lovable.app')) return 'lovable';
  if (window.location.hostname.includes('.pages.dev')) return 'cloudflare-pages';
  if (window.location.hostname === 'localhost') return 'development';
  
  return 'production';
};

// Dual configuration resolver
export const getActiveConfig = () => {
  const env = getEnvironment();
  
  return {
    environment: env,
    useCloudflare: env === 'cloudflare-pages' || CLOUDFLARE_CONFIG.FEATURES.USE_CF_WORKERS,
    useLovable: env === 'lovable' || !CLOUDFLARE_CONFIG.FEATURES.USE_CF_WORKERS,
    apiUrl: CLOUDFLARE_CONFIG.FEATURES.USE_CF_WORKERS 
      ? CLOUDFLARE_CONFIG.WORKER_BASE_URL 
      : import.meta.env.VITE_API_BASE_URL
  };
};
