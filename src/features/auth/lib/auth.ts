import NextAuth from 'next-auth';

import { siteFeatures } from '@/lib/config';
import { db } from '@/lib/prisma';

import { authConfig } from '@/features/auth/auth.config';
import { getTwoFactorConfirmationByUserId } from '@/features/auth/data/two-factor-confirmation';
import { getUserByIdWithoutPassword } from '@/features/auth/data/user';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
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

      const existingUser = await getUserByIdWithoutPassword(user.id);

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
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      // The user is not logged in
      if (!token.sub) {
        return token;
      }
      // Assign data from user to token
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
