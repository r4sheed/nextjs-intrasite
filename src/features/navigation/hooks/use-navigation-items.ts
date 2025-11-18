import { useMemo } from 'react';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { navigationItems } from '@/features/navigation/lib/navigation';

import type { NavigationItem } from '../types';

/**
 * Hook that returns filtered navigation items based on the current user's authentication status.
 * Guests see 'public' and 'guest' items, authenticated users see 'public' and 'protected' items.
 */
export const useNavigationItems = (): readonly NavigationItem[] => {
  const user = useCurrentUser();

  return useMemo(() => {
    const isGuest = !user;

    return navigationItems.filter(item => {
      // Guest user should not see protected routes
      if (isGuest && item.access === 'protected') {
        return false;
      }

      // Logged-in user should not see guest-only routes
      if (!isGuest && item.access === 'guest') {
        return false;
      }

      return true;
    });
  }, [user]);
};
