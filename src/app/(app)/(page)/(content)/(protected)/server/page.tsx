import { UserCard } from '@/features/auth/components/user-card';
import { currentUser } from '@/features/auth/lib/auth-utils';

export const dynamic = 'force-dynamic';

export default async function ServerPage() {
  const user = await currentUser();

  return <UserCard title=" 💻 Server user" user={user} />;
}
