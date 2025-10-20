import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/features/auth/lib/auth';

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="p-4">
      <div className="mb-6 rounded-md p-4">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
      <form
        action={async () => {
          'use server';

          await signOut();
        }}
      >
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}
