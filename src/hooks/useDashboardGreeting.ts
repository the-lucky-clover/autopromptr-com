
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { getTimeBasedGreeting } from "@/services/simpleGreetingService";

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
          const firstName = profile.name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
          const greeting = getTimeBasedGreeting(firstName);
          setCurrentGreeting(greeting);
        } else {
          // Fallback if no profile exists
          const firstName = user.email?.split('@')[0] || 'there';
          const greeting = getTimeBasedGreeting(firstName);
          setCurrentGreeting(greeting);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  return { userProfile, currentGreeting };
};
