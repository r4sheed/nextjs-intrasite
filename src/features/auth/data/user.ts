import { db } from '@/lib/prisma';

import { User } from '@/features/auth/models';

import type { User as PrismaUser } from '@prisma/client';

/**
 * Data access layer for User entity
 * Returns null on errors. Passwords excluded by default for security.
 */

/**
 * Fields to exclude when fetching user without password
 */
const USER_WITHOUT_PASSWORD_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  twoFactorEnabled: true,
} as const;

/**
 * Type for user data without password field
 */
export type UserWithoutPassword = Omit<PrismaUser, 'password'>;

/**
 * Options for user lookup
 */
export type UserLookupOptions = {
  id?: string;
  email?: string;
  includePassword?: boolean;
};

/**
 * Generic user lookup utility with error handling
 * @param where - Prisma where clause for ID or email
 * @param select - Optional field selection
 * @returns User object if found, null on error
 */
const findUser = async <T = PrismaUser>(
  where: { id: string } | { email: string },
  select?: Record<string, boolean>
): Promise<T | null> => {
  try {
    const user = await db.user.findUnique({
      where,
      ...(select && { select }),
    });

    return user as T | null;
  } catch (error) {
    // Log error for debugging but return null (let service layer handle the error)
    console.error('[findUser] Database error:', error);
    return null;
  }
};

/**
 * Unified user lookup function - defaults to password excluded
 * @param options - Lookup options (id/email/includePassword)
 * @returns User object if found, null on error
 */
export const getUser = async (
  options: UserLookupOptions
): Promise<PrismaUser | UserWithoutPassword | null> => {
  const { id, email, includePassword = false } = options;

  // Prioritize ID if provided
  if (id) {
    return includePassword
      ? await findUser({ id })
      : await findUser<UserWithoutPassword>(
          { id },
          USER_WITHOUT_PASSWORD_SELECT
        );
  }

  // Fall back to email if no ID provided
  if (email) {
    return includePassword
      ? await findUser({ email })
      : await findUser<UserWithoutPassword>(
          { email },
          USER_WITHOUT_PASSWORD_SELECT
        );
  }

  // Neither ID nor email provided
  return null;
};

/**
 * Fetch user by ID
 * @param userId - The user's unique identifier
 * @returns User object if found, null if not found or on database error
 */
export const getUserById = async (
  userId: string
): Promise<PrismaUser | null> => {
  return await findUser({ id: userId });
};

/**
 * Fetch user by email
 * @param email - The user's email address
 * @returns User object if found, null if not found or on database error
 */
export const getUserByEmail = async (
  email: string
): Promise<PrismaUser | null> => {
  return await findUser({ email });
};

/**
 * Verify user credentials with password checking
 * @param email - User email
 * @param password - Plain text password to verify
 * @returns User object for NextAuth if valid, null otherwise
 */
export const verifyUserCredentials = async (
  email: string,
  password: string
): Promise<(UserWithoutPassword & { isOAuth: boolean }) | null> => {
  // Fetch user with password
  const data = await getUser({ email, includePassword: true });

  // Type guard to check if user has password
  function hasPassword(
    user: PrismaUser | UserWithoutPassword
  ): user is PrismaUser {
    return 'password' in user;
  }

  // Ensure we have a full PrismaUser with password
  if (!data || !hasPassword(data)) return null;

  // Wrap in User model and verify password
  const user = new User(data);
  const isPasswordValid = await user.verifyPassword(password);

  if (!isPasswordValid) return null;

  // Return user without password for NextAuth
  return {
    ...user.toSafeObject(),
    isOAuth: false,
  };
};
