'use server';

import { UserRole } from '@prisma/client';

import { currentUserRole } from '@/lib/auth';

export const adminTest = async () => {
  const role = await currentUserRole();

  if (role !== UserRole.ADMIN) {
    return { success: false };
  }

  return { success: true };
};
