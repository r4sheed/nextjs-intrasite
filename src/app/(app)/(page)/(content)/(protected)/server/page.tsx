import { currentUser } from '@/lib/auth';

import { UserCard } from '@/features/auth/components/user-card';

export const dynamic = 'force-dynamic';

export default async function ServerPage() {
  const user = await currentUser();

  return (
    <div>
      <UserCard title=" 💻 Server user" user={user} />
    </div>
  );
}
