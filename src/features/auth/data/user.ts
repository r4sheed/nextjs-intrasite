import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { CoreErrors } from '@/lib/errors/definitions';
import prisma from '@/lib/prisma';
import { type Response, failure, success } from '@/lib/response';

/**
 * Data access layer for User entity
 * Throws AppError on database failures
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
): Promise<Response<T | null>> {
  try {
    const user = await prisma.user.findUnique({
      where,
      ...(select && { select }),
    });

    return success(user as T | null);
  } catch (error) {
    const identifier = ('id' in where ? where.id : where.email) || 'unknown';
    console.error(`[${operation}] Database error for ${identifier}:`, error);

    return failure(CoreErrors.DATABASE_ERROR(operation, identifier));
  }
}

/**
 * Unified user lookup function - prioritizes ID over email
 * @param options - Lookup options with id, email, or includePassword
 * @returns Response with user object if found, error response on database errors
 */
export async function getUser(
  options: UserLookupOptions
): Promise<Response<User | UserWithoutPassword | null>> {
  const { id, email, includePassword = true } = options;

  // Prioritize ID if provided
  if (id) {
    const response = includePassword
      ? await findUser('getUser', { id })
      : await findUser<UserWithoutPassword>(
          'getUser',
          { id },
          USER_WITHOUT_PASSWORD_SELECT
        );

    if (response.status === 'success') {
      return success(response.data);
    }
    return response;
  }

  // Fall back to email if no ID provided
  if (email) {
    const response = includePassword
      ? await findUser('getUser', { email })
      : await findUser<UserWithoutPassword>(
          'getUser',
          { email },
          USER_WITHOUT_PASSWORD_SELECT
        );

    if (response.status === 'success') {
      return success(response.data);
    }
    return response;
  }

  // Neither ID nor email provided
  return success(null);
}

/**
 * Fetch user by ID
 * @param userId - The user's unique identifier
 * @returns Response with user object if found, error response on database errors
 */
export async function getUserById(
  userId: string
): Promise<Response<User | null>> {
  const response = await findUser('getUserById', { id: userId });
  return response;
}

/**
 * Fetch user by email
 * @param email - The user's email address
 * @returns Response with user object if found, error response on database errors
 */
export async function getUserByEmail(
  email: string
): Promise<Response<User | null>> {
  const response = await findUser('getUserByEmail', { email });
  return response;
}

/**
 * Fetch user by ID without password field
 * @param userId - The user's unique identifier
 * @returns Response with user object without password if found, error response on database errors
 */
export async function getUserByIdWithoutPassword(
  userId: string
): Promise<Response<UserWithoutPassword | null>> {
  const response = await findUser<UserWithoutPassword>(
    'getUserByIdWithoutPassword',
    { id: userId },
    USER_WITHOUT_PASSWORD_SELECT
  );
  return response;
}

/**
 * Fetch user by email without password field
 * @param email - The user's email address
 * @returns Response with user object without password if found, error response on database errors
 */
export async function getUserByEmailWithoutPassword(
  email: string
): Promise<Response<UserWithoutPassword | null>> {
  const response = await findUser<UserWithoutPassword>(
    'getUserByEmailWithoutPassword',
    { email },
    USER_WITHOUT_PASSWORD_SELECT
  );
  return response;
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
  const userResponse = await getUserByEmail(email);

  if (userResponse.status === 'error') {
    // Throw the database error instead of returning it
    throw new Error('Database error occurred');
  }

  if (userResponse.status === 'success') {
    const user = userResponse.data;

    if (!user || !user.password) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Handle other response types (pending, partial) - though unlikely for this operation
  return null;
}
