
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
      .then((data) => {
        setPlatforms(data.filter((p: Platform) => p.type === 'web'));
      })
      .catch((err) => {
        console.error('Failed to load platforms:', err);
        toast({
          title: "Warning",
          description: "Failed to load automation platforms. Manual batch creation is still available.",
          variant: "destructive",
        });
      });
  }, [toast]);

  return { platforms };
};
