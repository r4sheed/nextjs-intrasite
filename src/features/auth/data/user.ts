
import { db } from '@/lib/prisma';

import { User } from '@/features/auth/models';

import type { User as PrismaUser } from '@prisma/client';

/**
 * Data access layer for User entity
 * Returns null on errors to let the service layer handle error responses
 * Returns null when user is not found (expected behavior)
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
} as const;

/**
 * Type for user without password
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
 * @param where - Prisma where clause
 * @param select - Optional select clause for specific fields
 * @returns User object if found, null if not found or on database error
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
 * Unified user lookup function - prioritizes ID over email
 * @param options - Lookup options with id, email, or includePassword
 * @returns User object if found, null if not found or on database error
 */
export const getUser = async (
  options: UserLookupOptions
): Promise<PrismaUser | UserWithoutPassword | null> => {
  const { id, email, includePassword = true } = options;

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
 * Fetch user by ID without password field
 * @param userId - The user's unique identifier
 * @returns User object without password if found, null if not found or on database error
 */
export const getUserByIdWithoutPassword = async (
  userId: string
): Promise<UserWithoutPassword | null> => {
  return await findUser<UserWithoutPassword>(
    { id: userId },
    USER_WITHOUT_PASSWORD_SELECT
  );
};

/**
 * Fetch user by email without password field
 * @param email - The user's email address
 * @returns User object without password if found, null if not found or on database error
 */
export const getUserByEmailWithoutPassword = async (
  email: string
): Promise<UserWithoutPassword | null> => {
  return await findUser<UserWithoutPassword>(
    { email },
    USER_WITHOUT_PASSWORD_SELECT
  );
};

/**
 * Verify user credentials (email + password)
 * @param email - The user's email address
 * @param password - The plain text password to verify
 * @returns User object without password if credentials are valid, null otherwise (including on database errors)
 *
 * @remarks
 * This function uses the User model's verifyPassword method for business logic.
 * The data layer fetches the raw Prisma user, then wraps it in the User model.
 */
export const verifyUserCredentials = async (
  email: string,
  password: string
): Promise<UserWithoutPassword | null> => {
  // Fetch user with password (includes password field)
  const prismaUser = await getUserByEmail(email);

  if (!prismaUser) return null;

  // Wrap in User model and verify password (business logic)
  const user = new User(prismaUser);
  const isPasswordValid = await user.verifyPassword(password);

  if (!isPasswordValid) return null;

  // Return user without password using model method
  return user.toSafeObject();
};
