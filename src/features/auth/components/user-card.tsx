import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { AuthUser } from '@/features/auth/lib/auth-utils';

interface UserCardProps {
  user?: AuthUser | null;
  title: string;
}

interface UserDataProps {
  label: string;
  value: string | null | undefined;
}

const UserData = ({ label, value }: UserDataProps) => {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="bg-accent-foreground/10 max-w-[180px] truncate rounded-md p-1 text-xs">
        {value || '??'}
      </p>
    </div>
  );
};

const UserCard = ({ user, title }: UserCardProps) => {
  return (
    <Card className="w-full max-w-sm min-w-[600px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserData label="userid" value={user?.id} />
        <UserData label="email" value={user?.email} />
        <UserData label="role" value={user?.role} />
      </CardContent>
    </Card>
  );
};

export { UserCard };
