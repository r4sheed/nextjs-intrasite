import { useSession as useNextAuthSession } from 'next-auth/react';

/**
 * Wraps the NextAuth session hook so feature code has a single import point.
 */
export const useSession = () => {
  const session = useNextAuthSession();

  return session;
};
