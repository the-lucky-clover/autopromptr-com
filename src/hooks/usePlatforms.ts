
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr } from '@/services/autoPromptr';
import { AutoPromptprError } from '@/services/autoPromptr/errors';
import { Platform } from '@/types/batch';

export const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const autoPromptr = new AutoPromptr();
    autoPromptr.getPlatforms()
      .then((platformArray) => {
        console.log('Successfully loaded platforms:', platformArray);
        // Now platformArray is already an array, so we can filter directly
        setPlatforms(platformArray.filter((p: Platform) => p.type === 'web'));
      })
      .catch((err) => {
        console.log('Platform loading error details:', {
          error: err,
          isAutoPromptprError: err instanceof AutoPromptprError,
          statusCode: err?.statusCode,
          code: err?.code,
          message: err?.message
        });
        
        // Check for 404 errors more reliably
        const is404Error = (err instanceof AutoPromptprError && err.statusCode === 404) ||
                          (err?.status === 404) ||
                          (err?.message?.includes('404'));
        
        if (is404Error) {
          console.log('Backend platform endpoint not available (404) - using fallback platforms silently');
          // Use default platforms as fallback without showing any error
          const fallbackPlatforms: Platform[] = [
            { id: 'lovable', name: 'Lovable', type: 'web' },
            { id: 'bolt', name: 'Bolt.new', type: 'web' },
            { id: 'v0', name: 'V0', type: 'web' },
            { id: 'replit', name: 'Replit', type: 'web' },
            { id: 'chatgpt', name: 'ChatGPT', type: 'web' },
            { id: 'claude', name: 'Claude', type: 'web' }
          ];
          setPlatforms(fallbackPlatforms);
        } else {
          // Only show error for unexpected failures (network errors, 500s, etc.)
          console.error('Unexpected platform loading error:', err);
          
          // Only show toast for truly unexpected errors
          const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('network');
          const isServerError = (err instanceof AutoPromptprError && err.statusCode >= 500);
          
          if (isNetworkError || isServerError) {
            toast({
              title: "Platform loading issue",
              description: "Unable to connect to backend. Using default platforms.",
              variant: "default",
            });
          }
          
          // Still provide fallback platforms
          const fallbackPlatforms: Platform[] = [
            { id: 'lovable', name: 'Lovable', type: 'web' },
            { id: 'bolt', name: 'Bolt.new', type: 'web' },
            { id: 'v0', name: 'V0', type: 'web' },
            { id: 'replit', name: 'Replit', type: 'web' },
            { id: 'chatgpt', name: 'ChatGPT', type: 'web' },
            { id: 'claude', name: 'Claude', type: 'web' }
          ];
          setPlatforms(fallbackPlatforms);
        }
      });
  }, [toast]);

  return { platforms };
};
