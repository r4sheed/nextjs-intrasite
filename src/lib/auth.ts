import { auth } from '@/features/auth/lib/auth';

import type { UserRole } from '@prisma/client';
import type { Session } from 'next-auth';

/**
 * Extended user type that includes role information from the database.
 */
export type AuthSession = Session;

/**
 * Extended user type that includes role information from the database.
 */
export type AuthUser = AuthSession['user'];

/**
 * Get the current authenticated user from the session.
 *
 * This function provides a convenient way to access the current user in server components
 * and server actions. It automatically handles session retrieval and type safety.
 *
 * @returns The current authenticated user, or null if not authenticated
 *
 * @example
 * ```typescript
 * // In a server component
 * export default async function ProfilePage() {
 *   const user = await currentUser();
 *
 *   if (!user) {
 *     redirect('/login');
 *   }
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a server action
 * 'use server';
 *
 * export async function updateProfile(data: ProfileData) {
 *   const user = await currentUser();
 *
 *   if (!user) {
 *     throw new Error('Not authenticated');
 *   }
 *
 *   // Update user profile...
 * }
 * ```
 */
export const currentUser = async (): Promise<AuthUser | null> => {
  const session = await auth();

  return session?.user ? (session.user as AuthUser) : null;
};

/**
 * Check if the current user has a specific role.
 *
 * @param requiredRole - The role to check for
 * @returns True if the user has the required role, false otherwise
 *
 * @example
 * ```typescript
 * export default async function AdminPage() {
 *   if (!await hasRole('ADMIN')) {
 *     return <div>Access denied</div>;
 *   }
 *
 *   return <div>Admin content</div>;
 * }
 * ```
 */
export const hasRole = async (requiredRole: UserRole): Promise<boolean> => {
  const user = await currentUser();

  return user?.role === requiredRole;
};

/**
 * Check if the current user has any of the specified roles.
 *
 * @param roles - Array of roles to check for
 * @returns True if the user has at least one of the required roles, false otherwise
 *
 * @example
 * ```typescript
 * export default async function ModeratorPage() {
 *   if (!await hasAnyRole(['MODERATOR', 'ADMIN'])) {
 *     return <div>Access denied</div>;
 *   }
 *
 *   return <div>Moderator content</div>;
 * }
 * ```
 */
export const hasAnyRole = async (roles: UserRole[]): Promise<boolean> => {
  const user = await currentUser();

  return user?.role ? roles.includes(user.role) : false;
};

/**
 * Check if the current user is authenticated.
 *
 * @returns True if a user is authenticated, false otherwise
 *
 * @example
 * ```typescript
 * export default async function ProtectedPage() {
 *   if (!await isAuthenticated()) {
 *     redirect('/login');
 *   }
 *
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await currentUser();

  return user !== null;
};

/**
 * Get the current user's role.
 *
 * @returns The user's role, or null if not authenticated
 *
 * @example
 * ```typescript
 * export default async function UserBadge() {
 *   const role = await currentUserRole();
 *
 *   return <span className="badge">{role || 'GUEST'}</span>;
 * }
 * ```
 */
export const currentUserRole = async (): Promise<UserRole | null> => {
  const user = await currentUser();

  return user?.role ?? null;
};

/**
 * Require authentication for a server component or action.
 *
 * This utility throws an error if the user is not authenticated,
 * making it easy to protect sensitive operations.
 *
 * @param message - Optional error message (defaults to 'Authentication required')
 * @returns The authenticated user
 * @throws Error if user is not authenticated
 *
 * @example
 * ```typescript
 * // In a server action
 * 'use server';
 *
 * export async function deleteAccount() {
 *   const user = await requireAuth('Cannot delete account without authentication');
 *
 *   // Delete account logic...
 * }
 * ```
 */
export const requireAuth = async (
  message = 'Authentication required'
): Promise<AuthUser> => {
  const user = await currentUser();

  if (!user) {
    throw new Error(message);
  }

  return user;
};

/**
 * Require a specific role for a server component or action.
 *
 * @param requiredRole - The role required for access
 * @param message - Optional error message
 * @returns The authenticated user with the required role
 * @throws Error if user is not authenticated or doesn't have the required role
 *
 * @example
 * ```typescript
 * // In a server action
 * 'use server';
 *
 * export async function banUser(userId: string) {
 *   await requireRole('ADMIN', 'Only administrators can ban users');
 *
 *   // Ban user logic...
 * }
 * ```
 */
export const requireRole = async (
  requiredRole: UserRole,
  message = `Role ${requiredRole} required`
): Promise<AuthUser> => {
  const user = await requireAuth();

  if (user.role !== requiredRole) {
    throw new Error(message);
  }

  return user;
};

/**
 * Get the current session with full type information.
 *
 * @returns The current session, or null if not authenticated
 *
 * @example
 * ```typescript
 * export default async function SessionInfo() {
 *   const session = await currentSession();
 *
 *   if (!session) {
 *     return <div>Not logged in</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Expires: {session.expires}</p>
 *       <p>User: {session.user.name}</p>
 *       <p>Role: {session.user.role}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const currentSession = async (): Promise<AuthSession | null> => {
  const session = await auth();

  return session ?? null;
};

/**
 * Check if the current user is an administrator.
 *
 * @returns True if the user has ADMIN role, false otherwise
 */
export const isAdmin = async (): Promise<boolean> => {
  return hasRole('ADMIN');
};

/**
 * Check if the current user is a moderator.
 *
 * @returns True if the user has MODERATOR role, false otherwise
 */
export const isModerator = async (): Promise<boolean> => {
  return hasRole('MODERATOR');
};

/**
 * Check if the current user is a regular user.
 *
 * @returns True if the user has USER role, false otherwise
 */
export const isUser = async (): Promise<boolean> => {
  return hasRole('USER');
};

/**
 * Authorization guard that checks if the current user can perform an action.
 *
 * This is a flexible utility for implementing custom authorization logic.
 *
 * @param predicate - Function that returns true if the action is allowed
 * @param message - Error message if authorization fails
 * @returns The authenticated user if authorized
 * @throws Error if not authorized
 *
 * @example
 * ```typescript
 * // Custom authorization based on user ID
 * export async function updatePost(postId: string, data: PostData) {
 *   const user = await authorize(
 *     async (user) => {
 *       const post = await getPostById(postId);
 *       return post.authorId === user.id || user.role === 'ADMIN';
 *     },
 *     'You can only edit your own posts'
 *   );
 *
 *   // Update post logic...
 * }
 * ```
 */
export const authorize = async (
  predicate: (user: AuthUser) => boolean | Promise<boolean>,
  message = 'Authorization failed'
): Promise<AuthUser> => {
  const user = await requireAuth();

  const allowed = await predicate(user);

  if (!allowed) {
    throw new Error(message);
  }

  return user;
};
