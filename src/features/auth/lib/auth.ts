import { UserRole } from '@prisma/client';
import NextAuth from 'next-auth';

import { authConfig } from '@/features/auth/auth.config';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ request, auth }) {
      return !!auth;
    },
    async jwt({ token, account, user, trigger, session }) {
      // The user is not logged in
      if (!token.sub) {
        return token;
      }

      // Access token from provider
      if (account) {
        token.accessToken = account.access_token;
      }

      // Extend token with user data
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }

      // Handle session updates from client
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token, user }) {
      if (token.sub && session.user) {
        session.accessToken = token.accessToken as string;
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }

      console.log('Session callback:', { session, token, user });
      return session;
    },
  },
  session: { strategy: 'jwt' },
});
