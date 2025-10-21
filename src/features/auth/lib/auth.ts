import NextAuth from 'next-auth';

import { authConfig } from '@/features/auth/auth.config';
import { getUserByIdWithoutPassword } from '@/features/auth/data/user';
import { siteFeatures } from '@/lib/config';
import { db } from '@/lib/prisma';

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
    async authorized({ request, auth }) {
      return !!auth;
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') {
        return true;
      }

      // Allow signing in where verification is disabled
      if (!siteFeatures.requireEmailVerification) {
        return true;
      }

      // Check for a valid user.
      if (!user.id) {
        return false;
      }

      const data = await getUserByIdWithoutPassword(user.id);

      // Prevent sign in without email verification
      return !!data?.emailVerified;
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
