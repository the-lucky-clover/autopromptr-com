
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr } from '@/services/autoPromptr';
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
        console.log('Platform loading error:', err);
        
        // Only show error toast for unexpected errors, not 404s (which are expected when backend is not available)
        if (err?.message?.includes('404') || err?.status === 404) {
          console.log('Backend platform endpoint not available (404) - using fallback platforms silently');
          // Use default platforms as fallback without showing error
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
          toast({
            title: "Platform loading issue",
            description: "Unable to load automation platforms from backend. Using default platforms.",
            variant: "default", // Use default instead of destructive for less alarming appearance
          });
          
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
