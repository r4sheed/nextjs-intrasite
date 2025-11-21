'use client';

import { UserRole } from '@prisma/client';
import { toast } from 'sonner';

import { FormSuccess } from '@/components/form-status';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';

import { adminTest } from '@/features/auth/actions/admin-test';
import { RoleBoundary } from '@/features/auth/components/role-boundary';

export default function AdminPage() {
  const onApiRouteClick = () => {
    fetch('/api/admin').then(response => {
      if (response.ok) {
        toast.success('You have API Route access!');
      } else {
        toast.success('You cannot access API Route!');
      }
    });
  };

  const onServerActionClick = () => {
    adminTest().then(response => {
      if (response.success) {
        toast.success('You have server action access!');
      } else {
        toast.success('You cannot access server actions!');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin page</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CardDescription>Admin section</CardDescription>
          <RoleBoundary role={UserRole.ADMIN}>
            <FormSuccess message="You are allowed to view this content" />
          </RoleBoundary>

          <CardDescription>Moderator section</CardDescription>
          <RoleBoundary role={UserRole.MODERATOR}>
            <FormSuccess message="You are allowed to view this content" />
          </RoleBoundary>

          <CardDescription>API Routes</CardDescription>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3">
            <p className="text-sm font-medium">Admin-only API Route</p>
            <Button onClick={onApiRouteClick}>Test</Button>
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3">
            <p className="text-sm font-medium">Admin-only Server Action</p>
            <Button onClick={onServerActionClick}>Test</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
