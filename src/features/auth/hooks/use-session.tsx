import { useSession as useNextAuthSession } from 'next-auth/react';

export const useSession = () => {
  const session = useNextAuthSession();

  return session;
};
