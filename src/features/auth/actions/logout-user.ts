'use server';

import { signOut } from '@/features/auth/lib/auth';

/**
 * Successful logout response data.
 * Contains confirmation that the user has been logged out.
 */
export type LogoutUserData = {
  success: true;
};

/**
 * Server Action to log out the current user session.
 *
 * This action terminates the user's authentication session by calling NextAuth's
 * signOut function. It handles any potential errors during the logout process
 * and provides appropriate error responses.
 *
 * @returns A Response object confirming successful logout, or an error response if logout fails.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // Perform the logout operation
    await signOut({ redirect: false });
  } catch (error) {
    // Log the error for debugging
    console.error('[AUTH] Logout failed:', error);
  }
};
