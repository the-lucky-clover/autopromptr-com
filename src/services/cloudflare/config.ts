
// Cloudflare-specific configuration
export const CLOUDFLARE_CONFIG = {
  // Cloudflare Pages environment detection
  IS_CLOUDFLARE_PAGES: typeof window !== 'undefined' && window.location.hostname.includes('.pages.dev'),
  
  // Cloudflare Workers API endpoints
  WORKER_BASE_URL: import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 
    (import.meta.env.PROD 
      ? 'https://autopromptr-worker.autopromptr.workers.dev'  
      : 'http://localhost:8787'),
  
  // Site URL
  SITE_URL: import.meta.env.VITE_SITE_URL || 'https://autopromptr.pages.dev',
  
  // Feature flags
  FEATURES: {
    USE_CF_WORKERS: true, // Always use Cloudflare Workers
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
