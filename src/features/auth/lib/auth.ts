import { UserRole } from '@prisma/client';
import NextAuth from 'next-auth';

import { siteFeatures } from '@/lib/config';
import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';

import { authConfig } from '@/features/auth/auth.config';
import { getAccountByUserId } from '@/features/auth/data/account';
import { getTwoFactorConfirmationByUserId } from '@/features/auth/data/two-factor-confirmation';
import { getUserById } from '@/features/auth/data/user';

import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Account, Profile, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { NextURL } from 'next/dist/server/web/next-url';

type SessionUser = Session['user'];

/**
 * Narrowed view of the JWT we can safely mutate inside Auth.js callbacks.
 */
type MutableToken = JWT & {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role?: UserRole | undefined;
  twoFactorEnabled?: boolean | undefined;
  isOAuthAccount?: boolean | undefined;
};

/**
 * User properties that we mirror between the JWT payload and the session object.
 */
type UserSnapshot = Pick<
  SessionUser,
  'name' | 'email' | 'image' | 'role' | 'twoFactorEnabled' | 'isOAuthAccount'
>;

const asMutableToken = (token: JWT): MutableToken => token as MutableToken;

/**
 * Removes privileged user-related fields from the JWT so that stale data does not leak between requests.
 */
const resetTokenUserSnapshot = (token: JWT) => {
  const mutable = asMutableToken(token);

  mutable.name = null;
  mutable.email = null;
  mutable.picture = null;
  mutable.role = UserRole.USER;
  mutable.twoFactorEnabled = false;
  mutable.isOAuthAccount = false;

  return token;
};

/**
 * Writes the provided user snapshot onto the JWT after clearing previous values.
 * @param token - The JWT token to update.
 * @param snapshot - The user data snapshot to apply.
 * @returns The updated JWT token.
 */
const updateTokenFromUser = (token: JWT, snapshot: Partial<UserSnapshot>) => {
  const mutable = asMutableToken(resetTokenUserSnapshot(token));

  if (snapshot.name !== undefined) {
    mutable.name = snapshot.name ?? null;
  }
  if (snapshot.email !== undefined) {
    mutable.email = snapshot.email ?? null;
  }
  if (snapshot.image !== undefined) {
    mutable.picture = snapshot.image ?? null;
  }
  if (snapshot.role !== undefined) {
    mutable.role = snapshot.role;
  }
  if (snapshot.twoFactorEnabled !== undefined) {
    mutable.twoFactorEnabled = snapshot.twoFactorEnabled;
  }
  if (snapshot.isOAuthAccount !== undefined) {
    mutable.isOAuthAccount = snapshot.isOAuthAccount;
  }

  return token;
};

/**
 * Projects the JWT payload onto the session user object so client code receives the latest snapshot.
 * @param sessionUser - The current session user object.
 * @param token - The JWT token containing the latest user data.
 * @returns The updated session user object.
 */
const mergeTokenIntoSessionUser = (
  sessionUser: SessionUser,
  token: JWT
): SessionUser => {
  const mutable = asMutableToken(token);
  const next: SessionUser = {
    ...sessionUser,
    id: token.sub ?? sessionUser.id,
  };

  if (mutable.name !== undefined) {
    next.name = mutable.name ?? null;
  }
  if (mutable.email !== undefined) {
    next.email = mutable.email ?? null;
  }
  if (mutable.picture !== undefined) {
    next.image = mutable.picture ?? null;
  }
  if (mutable.role !== undefined) {
    next.role = mutable.role ?? UserRole.USER;
  }
  if (mutable.twoFactorEnabled !== undefined) {
    next.twoFactorEnabled = mutable.twoFactorEnabled ?? false;
  }
  if (mutable.isOAuthAccount !== undefined) {
    next.isOAuthAccount = mutable.isOAuthAccount ?? false;
  }

  return next;
};

/**
 * Guards database lookups in the JWT callback when running in an Edge runtime, where Prisma is unavailable.
 */
const canQueryDatabaseForToken =
  typeof process === 'undefined' || process.env.NEXT_RUNTIME !== 'edge';

const events = {
  /**
   * Marks the user's email as verified when linking an OAuth account.
   */
  async linkAccount(message: {
    user: User | AdapterUser;
    account: Account;
    profile: User | AdapterUser;
  }) {
    // Mark email as verified when linking an OAuth account
    await db.user.update({
      where: { id: message.user.id },
      data: { emailVerified: new Date() },
    });

    console.log(
      `Linked account for user: ${message.user.id} via ${message.account.provider}`
    );
  },
  async signIn(message: {
    user: User;
    account?: Account | null;
    profile?: Profile;
    isNewUser?: boolean;
  }) {
    console.log(
      `User signed in: ${message.user.id} via ${message.account?.provider}`
    );
  },
} satisfies NonNullable<NextAuthConfig['events']>;

export const authCallbacks = {
  /**
   * Checks if the user is authorized to access a protected route.
   */
  async authorized(message: {
    auth: Session | null;
    request: { nextUrl: NextURL };
  }) {
    return !!message.auth;
  },
  /**
   * Handles the sign-in process, including validation for credentials and OAuth.
   */
  async signIn(message: { user: User; account?: Account | null }) {
    // Allow OAuth without email verification
    if (message.account?.provider !== 'credentials') {
      return true;
    }

    // Allow signing in where verification is disabled
    if (!siteFeatures.emailVerification) {
      return true;
    }

    // Check for a valid user.
    if (!message.user.id) {
      return false;
    }

    const existingUser = await getUserById(message.user.id);

    // Prevent sign in without email verification
    const emailVerified = !!existingUser?.emailVerified;
    if (!emailVerified) {
      return false;
    }

    // Prevent sign in without completing two-factor authentication
    if (siteFeatures.twoFactorAuth && existingUser?.twoFactorEnabled) {
      const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (!twoFactorConfirmation) {
        return false;
      }

      // Delete the used two-factor confirmation
      try {
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      } catch (error) {
        logger.forAuth().error(
          {
            userId: existingUser.id,
            confirmationId: twoFactorConfirmation.id,
            error: error instanceof Error ? error.message : String(error),
            code: 'AUTH_2FA_CLEANUP_FAILED',
          },
          'Failed to delete 2FA confirmation'
        );
        // Don't allow sign-in if cleanup fails
        return false;
      }
    }

    return true;
  },
  /**
   * Handles JWT token creation and updates during authentication.
   */
  async jwt(message: { token: JWT; user?: User }) {
    // Ensure the subject claim always mirrors the authenticated user's id.
    if (message.user?.id) {
      message.token.sub = message.user.id;
    }

    if (!message.token.sub) {
      return resetTokenUserSnapshot(message.token);
    }

    // During sign-in we already have fresh user data provided by the adapter.
    if (message.user) {
      return updateTokenFromUser(message.token, {
        name: message.user.name,
        email: message.user.email,
        image: message.user.image,
        role: message.user.role,
        twoFactorEnabled: message.user.twoFactorEnabled,
        isOAuthAccount: message.user.isOAuthAccount,
      });
    }

    // When running on the Edge we cannot reach Prisma, so we skip the refresh.
    if (!canQueryDatabaseForToken) {
      return message.token;
    }

    // On subsequent requests, refresh the snapshot from the database so role/2FA changes propagate.
    const databaseUser = await getUserById(message.token.sub);

    if (!databaseUser) {
      // User no longer exists in database, invalidate the session
      return null;
    }

    const account = await getAccountByUserId(databaseUser.id);

    return updateTokenFromUser(message.token, {
      name: databaseUser.name,
      email: databaseUser.email,
      image: databaseUser.image,
      role: databaseUser.role,
      twoFactorEnabled: databaseUser.twoFactorEnabled,
      isOAuthAccount: !!account,
    });
  },
  /**
   * Updates the session object with the latest user data from the JWT.
   */
  async session(message: { session: Session; token: JWT }) {
    if (!message.session.user) {
      return message.session;
    }

    return {
      ...message.session,
      // Merge the token snapshot onto the session payload the client consumes.
      user: mergeTokenIntoSessionUser(message.session.user, message.token),
    };
  },
} satisfies NonNullable<NextAuthConfig['callbacks']>;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  events,
  callbacks: authCallbacks,
} as NextAuthConfig);
