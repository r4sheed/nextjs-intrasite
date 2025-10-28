import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { databaseError } from '@/lib/errors';
import { db } from '@/lib/prisma';

/**
 * Data access layer for User entity
 * Throws AppError on database errors
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
export type UserWithoutPassword = Omit<User, 'password'>;

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
 * @param operation - The operation name for logging
 * @param where - Prisma where clause
 * @param select - Optional select clause for specific fields
 * @returns Response with user object if found, error response on database errors
 */
async function findUser<T = User>(
  operation: string,
  where: { id: string } | { email: string },
  select?: Record<string, boolean>
): Promise<T | null> {
  try {
    const user = await db.user.findUnique({
      where,
      ...(select && { select }),
    });

    return user as T | null;
  } catch (error) {
    const identifier = ('id' in where ? where.id : where.email) || 'unknown';
    console.error(`[${operation}] Database error for ${identifier}:`, error);

    // Service layer should throw AppError for expected errors so callers can
    // handle or convert them to Responses at the action layer.
    throw databaseError(operation, identifier);
  }
}

/**
 * Unified user lookup function - prioritizes ID over email
 * @param options - Lookup options with id, email, or includePassword
 * @returns Response with user object if found, error response on database errors
 */
export async function getUser(
  options: UserLookupOptions
): Promise<User | UserWithoutPassword | null> {
  const { id, email, includePassword = true } = options;

  // Prioritize ID if provided
  if (id) {
    return includePassword
      ? await findUser('getUser', { id })
      : await findUser<UserWithoutPassword>(
          'getUser',
          { id },
          USER_WITHOUT_PASSWORD_SELECT
        );
  }

  // Fall back to email if no ID provided
  if (email) {
    return includePassword
      ? await findUser('getUser', { email })
      : await findUser<UserWithoutPassword>(
          'getUser',
          { email },
          USER_WITHOUT_PASSWORD_SELECT
        );
  }

  // Neither ID nor email provided
  return null;
}

/**
 * Fetch user by ID
 * @param userId - The user's unique identifier
 * @returns Response with user object if found, error response on database errors
 */
export async function getUserById(userId: string): Promise<User | null> {
  return await findUser('getUserById', { id: userId });
}

/**
 * Fetch user by email
 * @param email - The user's email address
 * @returns Response with user object if found, error response on database errors
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return await findUser('getUserByEmail', { email });
}

/**
 * Fetch user by ID without password field
 * @param userId - The user's unique identifier
 * @returns Response with user object without password if found, error response on database errors
 */
export async function getUserByIdWithoutPassword(
  userId: string
): Promise<UserWithoutPassword | null> {
  return await findUser<UserWithoutPassword>(
    'getUserByIdWithoutPassword',
    { id: userId },
    USER_WITHOUT_PASSWORD_SELECT
  );
}

/**
 * Fetch user by email without password field
 * @param email - The user's email address
 * @returns Response with user object without password if found, error response on database errors
 */
export async function getUserByEmailWithoutPassword(
  email: string
): Promise<UserWithoutPassword | null> {
  return await findUser<UserWithoutPassword>(
    'getUserByEmailWithoutPassword',
    { email },
    USER_WITHOUT_PASSWORD_SELECT
  );
}

/**
 * Verify user credentials (email + password)
 * @param email - The user's email address
 * @param password - The plain text password to verify
 * @returns User object without password if credentials are valid, throws AppError on database errors
 * @throws AppError when database error occurs
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<UserWithoutPassword | null> {
  // Fetch user with password
  const user = await getUserByEmail(email);

  if (!user || !user.password) return null;

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) return null;

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
