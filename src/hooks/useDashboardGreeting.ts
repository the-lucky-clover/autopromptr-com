
import { useState, useEffect } from 'react';
import { CloudflareUser } from '@/integrations/cloudflare/client';
import { cloudflare } from "@/integrations/cloudflare/client";
import { getTimeBasedGreeting } from "@/services/simpleGreetingService";
import { useAuth } from './useAuth';

interface GreetingObject {
  greeting: string;
  firstName: string;
  encouragement: string;
}

export const useDashboardGreeting = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentGreeting, setCurrentGreeting] = useState<GreetingObject>({
    greeting: 'Good morning',
    firstName: 'there',
    encouragement: 'Ready to automate your workflow!'
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only load greeting once per page load session
    if (isInitialized) return;

    const loadUserProfile = async () => {
      if (user) {
        const { data: profile } = await cloudflare
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
      } else {
        setCurrentGreeting({
          greeting: 'Hello',
          firstName: 'there',
          encouragement: 'Welcome to AutoPromptr!'
        });
      }
      
      setIsInitialized(true);
    };

    loadUserProfile();
  }, [user, isInitialized]);

  return currentGreeting;
};
