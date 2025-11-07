'use client';

import { FormError } from '@/components/form-status';

import { useCurrentRole } from '@/features/auth/hooks/use-current-role';

import type { UserRole } from '@prisma/client';

interface RoleBoundaryProps {
  role: UserRole;
  children: React.ReactNode;
}

const RoleBoundary = ({ role, children }: RoleBoundaryProps) => {
  const userRole = useCurrentRole();

  if (role !== userRole) {
    return (
      <FormError message="You have not permission to view this content!" />
    );
  }

  return <>{children}</>;
};

export { RoleBoundary };
