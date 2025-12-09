/// <reference types="vite/client" />

// Fix for ImportMeta.env type
interface ImportMetaEnv {
  readonly VITE_CLOUDFLARE_WORKER_URL: string;
  readonly VITE_CLOUDFLARE_SITE_URL: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_FLASK_BACKEND_URL: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_API_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
