
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import App from './App.tsx';
import './index.css';
import './styles/animations.css';
import './styles/enhanced-animations.css';
import './styles/shimmer-animations.css';
import './styles/glassmorphism.css';
import './styles/skeuomorphic-design.css';
import './styles/holographic-effects.css';
import './styles/scan-line-effects.css';
import './styles/scroll-animations.css';
import './styles/psychedelic-animations.css';
import './styles/psychological-animations.css';
import './styles/nuclear-animations.css';
import './styles/award-winning-ux.css';
import { SecurityHeaders } from './services/security/securityHeaders';

// Initialize security headers (safe for embedded mode)
if (typeof window !== 'undefined') {
  const isEmbedded = window.self !== window.top;
  if (isEmbedded) {
    console.log('🖼️ Running in iframe - security headers will be iframe-friendly');
  }
  SecurityHeaders.init();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

console.log('Main.tsx: Starting app initialization');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}

console.log('Main.tsx: Root element found, creating React root');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);

console.log('Main.tsx: React root created and rendered');
