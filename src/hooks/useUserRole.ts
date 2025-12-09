
import { useAuth } from './useAuth';
import { cloudflare } from '@/integrations/cloudflare/client';
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
        const { data, error } = await cloudflare.rpc('get_user_role', {
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

  const isAdmin = role === 'admin';

  // Function to set user role (only available to admins)
  const setUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!isAdmin) {
      throw new Error('Only admins can modify user roles');
    }

    try {
      const { error } = await cloudflare.rpc('set_user_role', {
        _user_id: userId,
        _role: newRole
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update user role:', error);
      return { success: false, error };
    }
  };

  return {
    role,
    isAdmin,
    loading,
    user,
    setUserRole
  };
};
