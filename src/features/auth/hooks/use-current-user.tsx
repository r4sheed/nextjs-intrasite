import { useSession } from './use-session';

import type { AuthUser } from '@/features/auth/lib/auth-utils';

const isAuthUser = (user: unknown): user is AuthUser => {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const candidate = user as { id?: unknown };

  return typeof candidate.id === 'string';
};

/**
 * Returns the authenticated user from session data or null when unauthenticated.
 */
export const useCurrentUser = (): AuthUser | null => {
  const session = useSession();
  const user = session.data?.user;

  return isAuthUser(user) ? user : null;
};
