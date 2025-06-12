
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const ScriptErrorHandler = () => {
  useEffect(() => {
    const handleScriptError = (event: ErrorEvent) => {
      console.warn('Script loading error caught:', event.filename, event.message);
      
      // Only show toast for critical script errors, not third-party tracking
      if (event.filename && !event.filename.includes('facebook.com')) {
        toast({
          title: "Loading Issue",
          description: "Some features may be temporarily unavailable. Please refresh if you experience problems.",
          variant: "destructive",
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      
      // Prevent the error from being logged to console for certain known issues
      if (event.reason?.toString().includes('Failed to fetch')) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleScriptError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleScriptError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
};

export default ScriptErrorHandler;
