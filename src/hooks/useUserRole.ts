
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
        // Use the database function to get user role
        const { data, error } = await supabase.rpc('get_user_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role on error
        } else {
          setRole(data || 'user');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isSysOp = role === 'sysop';
  const isAdmin = role === 'admin' || role === 'sysop';

  return {
    role,
    isSysOp,
    isAdmin,
    loading,
    user
  };
};
