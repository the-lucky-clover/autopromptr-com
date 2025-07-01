
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { getRandomGreeting } from "@/services/greetingService";

export const useDashboardGreeting = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentGreeting, setCurrentGreeting] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          const greeting = getRandomGreeting(
            profile.name || user.email?.split('@')[0] || 'there',
            (profile as any).preferred_language || 'en'
          );
          setCurrentGreeting(greeting);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Remove the auto-refresh interval - greeting only loads on page load
  
  return { userProfile, currentGreeting };
};
