'use client';

import { UserCard } from '@/features/auth/components/user-card';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

export default function ClientPage() {
  const user = useCurrentUser();

  return <UserCard title=" 🙍‍♂️ Client user" user={user} />;
}
