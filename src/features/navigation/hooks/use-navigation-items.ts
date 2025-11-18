import { useMemo } from 'react';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { navigationItems } from '@/features/navigation/lib/navigation';

import type { NavigationItem } from '@/features/navigation/types';

/**
 * Hook that returns filtered navigation items based on the current user's authentication status and roles.
 * Guests see 'public' and 'guest' items, authenticated users see 'public' and 'protected' items.
 * Additionally, items with specific roles are only shown to users with matching roles.
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

      // If roles are specified, check if user has required role
      if (item.meta?.roles && item.meta.roles.length > 0) {
        if (!user?.role || !item.meta.roles.includes(user.role)) {
          return false;
        }
      }

      return true;
    });
  }, [user]);
};
