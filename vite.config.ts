import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // UI components from Radix
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // Icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // Charts
          if (id.includes('node_modules/recharts/') || 
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Utilities
          if (id.includes('node_modules/date-fns/') || 
              id.includes('node_modules/clsx/') ||
              id.includes('node_modules/tailwind-merge/') ||
              id.includes('node_modules/class-variance-authority/')) {
            return 'vendor-utils';
          }
          // Form handling
          if (id.includes('node_modules/react-hook-form/') || 
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/zod/')) {
            return 'vendor-forms';
          }
          // Sonner toasts
          if (id.includes('node_modules/sonner/')) {
            return 'vendor-toast';
          }
        },
      },
    },
  },
}));
