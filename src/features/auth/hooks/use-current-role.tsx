import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

import type { UserRole } from '@prisma/client';

/**
 * Returns the role of the authenticated user or null when unauthenticated.
 */
export const useCurrentRole = (): UserRole | null => {
  const user = useCurrentUser();

  return user?.role ?? null;
};
