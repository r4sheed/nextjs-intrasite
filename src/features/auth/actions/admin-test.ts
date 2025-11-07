'use server';

import { UserRole } from '@prisma/client';

import { currentUserRole } from '@/lib/auth';

/*
 * Action to test if the current user is an admin.
 */
export const adminTest = async () => {
  const role = await currentUserRole();

  if (role !== UserRole.ADMIN) {
    return { success: false };
  }

  return { success: true };
};
