
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin' | 'sysop';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        // Use the database function to get user role (now checks is_super_user)
        const { data, error } = await supabase.rpc('get_user_role', {
          _user_id: user.id
        });

        if (error) {
          // Reduced logging - only log once per session
          if (!sessionStorage.getItem('roleErrorLogged')) {
            console.log('User role fetch failed, using default role');
            sessionStorage.setItem('roleErrorLogged', 'true');
          }
          setRole('user'); // Default to user role on error
        } else {
          const userRole = data || 'user';
          // Ensure the role is valid
          if (['user', 'admin', 'sysop'].includes(userRole)) {
            setRole(userRole as UserRole);
          } else {
            setRole('user');
          }
        }
      } catch (error) {
        // Reduced logging
        if (!sessionStorage.getItem('roleErrorLogged')) {
          console.log('User role system unavailable, using default role');
          sessionStorage.setItem('roleErrorLogged', 'true');
        }
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isSysOp = role === 'sysop';
  const isAdmin = role === 'admin' || role === 'sysop';

  // Function to promote/demote users (only available to sysops)
  const setSuperUser = async (userId: string, isSuper: boolean) => {
    if (!isSysOp) {
      throw new Error('Only system operators can modify user privileges');
    }

    try {
      const { error } = await supabase.rpc('set_super_user', {
        _user_id: userId,
        _is_super: isSuper
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update user privileges:', error);
      return { success: false, error };
    }
  };

  return {
    role,
    isSysOp,
    isAdmin,
    loading,
    user,
    setSuperUser
  };
};
