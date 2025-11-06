import { Button } from '@/components/ui/button';

import { logoutUser } from '@/features/auth/actions/logout-user';
import { auth } from '@/features/auth/lib/auth';

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="p-4">
      <div className="mb-6 rounded-md p-4">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
      <form action={logoutUser}>
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}
