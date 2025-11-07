'use server';

import { signOut } from '@/features/auth/lib/auth';

/**
 * Logs out the current user by calling NextAuth's signOut function.
 * This is a Server Action that can be used in Client Components.
 */
export async function logoutUser() {
  await signOut();
}
