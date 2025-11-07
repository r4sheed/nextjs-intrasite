import NextAuth from 'next-auth';

import { siteFeatures } from '@/lib/config';
import { db } from '@/lib/prisma';

import { authConfig } from '@/features/auth/auth.config';
import { getTwoFactorConfirmationByUserId } from '@/features/auth/data/two-factor-confirmation';
import { getUserById } from '@/features/auth/data/user';

import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type SessionUser = Session['user'];

/**
 * Narrowed view of the JWT we can safely mutate inside Auth.js callbacks.
 */
type MutableToken = JWT & {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role?: SessionUser['role'];
};

/**
 * User properties that we mirror between the JWT payload and the session object.
 */
type UserSnapshot = Pick<SessionUser, 'name' | 'email' | 'image' | 'role'>;

const asMutableToken = (token: JWT): MutableToken => token as MutableToken;

/**
 * Removes privileged user-related fields from the JWT so that stale data does not leak between requests.
 */
const resetTokenUserSnapshot = (token: JWT) => {
  const mutable = asMutableToken(token);

  mutable.name = null;
  mutable.email = null;
  mutable.picture = null;
  mutable.role = undefined;

  return token;
};

/**
 * Writes the provided user snapshot onto the JWT after clearing previous values.
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

  return token;
};

/**
 * Projects the JWT payload onto the session user object so client code receives the latest snapshot.
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
    next.role = mutable.role;
  }

  return next;
};

/**
 * Guards database lookups in the JWT callback when running in an Edge runtime, where Prisma is unavailable.
 */
const canQueryDatabaseForToken =
  typeof process === 'undefined' || process.env.NEXT_RUNTIME !== 'edge';

const events = {
  async linkAccount({ user }) {
    // Mark email as verified when linking an OAuth account
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  },
} satisfies NonNullable<NextAuthConfig['events']>;

export const authCallbacks = {
  async authorized({ auth }) {
    return !!auth;
  },
  async signIn({ user, account }) {
    // Allow OAuth without email verification
    if (account?.provider !== 'credentials') {
      return true;
    }

    // Allow signing in where verification is disabled
    if (!siteFeatures.emailVerification) {
      return true;
    }

    // Check for a valid user.
    if (!user.id) {
      return false;
    }

    const existingUser = await getUserById(user.id);

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
        console.error(
          '[AUTH] Failed to delete 2FA confirmation for user',
          existingUser.id,
          error
        );
        // Don't allow sign-in if cleanup fails
        return false;
      }
    }

    return true;
  },
  async jwt({ token, user }) {
    // Ensure the subject claim always mirrors the authenticated user's id.
    if (user?.id) {
      token.sub = user.id;
    }

    if (!token.sub) {
      return resetTokenUserSnapshot(token);
    }

    // During sign-in we already have fresh user data provided by the adapter.
    if (user) {
      return updateTokenFromUser(token, {
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
        role: user.role,
      });
    }

    // When running on the Edge we cannot reach Prisma, so we skip the refresh.
    if (!canQueryDatabaseForToken) {
      return token;
    }

    // On subsequent requests, refresh the snapshot from the database so role/2FA changes propagate.
    const databaseUser = await getUserById(token.sub);

    if (!databaseUser) {
      return resetTokenUserSnapshot(token);
    }

    return updateTokenFromUser(token, {
      name: databaseUser.name ?? null,
      email: databaseUser.email ?? null,
      image: databaseUser.image ?? null,
      role: databaseUser.role,
    });
  },
  async session({ session, token }) {
    if (!session.user) {
      return session;
    }

    return {
      ...session,
      // Merge the token snapshot onto the session payload the client consumes.
      user: mergeTokenIntoSessionUser(session.user, token),
    };
  },
} satisfies NonNullable<NextAuthConfig['callbacks']>;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  events,
  callbacks: authCallbacks,
});
