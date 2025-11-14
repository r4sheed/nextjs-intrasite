'use client';

import { useTranslations } from 'next-intl';

import { FormError } from '@/components/form-status';

import { useCurrentRole } from '@/features/auth/hooks/use-current-role';
import { AUTH_ERRORS } from '@/features/auth/lib/strings';

import type { UserRole } from '@prisma/client';
interface RoleBoundaryProps {
  role: UserRole;
  children: React.ReactNode;
}

const RoleBoundary = ({ role, children }: RoleBoundaryProps) => {
  const userRole = useCurrentRole();
  const t = useTranslations('auth');

  if (role !== userRole) {
    return <FormError message={t(AUTH_ERRORS.insufficientPermissions)} />;
  }

  return <>{children}</>;
};

export { RoleBoundary };
