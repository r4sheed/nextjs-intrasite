import NextAuth from 'next-auth';

import { authConfig } from '@/features/auth/auth.config';
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
    authorized({ request, auth }) {
      return !!auth;
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
