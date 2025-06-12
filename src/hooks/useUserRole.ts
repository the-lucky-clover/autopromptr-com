
import { useAuth } from './useAuth';

export type UserRole = 'user' | 'admin' | 'sysop';

export const useUserRole = () => {
  const { user } = useAuth();

  const getUserRole = (): UserRole => {
    if (!user) return 'user';
    
    // God account detection
    if (user.email === 'pounds1@gmail.com') {
      return 'sysop';
    }
    
    // Add more admin users here if needed
    const adminEmails = ['admin@example.com'];
    if (adminEmails.includes(user.email || '')) {
      return 'admin';
    }
    
    return 'user';
  };

  const role = getUserRole();
  const isSysOp = role === 'sysop';
  const isAdmin = role === 'admin' || role === 'sysop';

  return {
    role,
    isSysOp,
    isAdmin,
    user
  };
};
