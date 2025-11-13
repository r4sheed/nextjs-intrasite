import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { AuthUser } from '@/features/auth/lib/auth-utils';

interface UserCardProps {
  user?: AuthUser | null;
  title: string;
}

interface UserDataProps {
  label: string;
  value: string | boolean | null | undefined;
  text?: {
    true: string;
    false: string;
  };
}

const UserData = ({ label, value, text }: UserDataProps) => {
  const displayValue =
    typeof value === 'boolean' && text
      ? value
        ? text.true
        : text.false
      : value;

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3">
      <Badge>{label}</Badge>
      <p className="max-w-[180px] truncate">
        <Badge variant="secondary">{displayValue}</Badge>
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
        <UserData label="name" value={user?.name} />
        <UserData label="role" value={user?.role} />
        <UserData
          label="twoFactorEnabled"
          value={user?.twoFactorEnabled}
          text={{ true: 'Enabled', false: 'Disabled' }}
        />
        <UserData
          label="isOAuth"
          value={user?.isOAuth}
          text={{ true: 'Yes', false: 'No' }}
        />
      </CardContent>
    </Card>
  );
};

export { UserCard };
