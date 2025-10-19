import { PrismaAdapter } from '@auth/prisma-adapter';
import authConfig from 'auth.config';
import NextAuth from 'next-auth';

import { getUserById } from '@/features/auth/data/user';
import prisma from '@/lib/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    authorized({ request, auth }) {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    async jwt({ token, trigger, session, account }) {
      if (trigger === 'update') {
        token.name = session.user.name;
      }

      if (!token.sub) {
        return token;
      }

      const userResponse = await getUserById(token.sub);

      if (userResponse.status === 'error') {
        console.error(
          'JWT callback: Failed to fetch user:',
          userResponse.error
        );
        return token;
      }

      if (userResponse.status === 'success') {
        const user = userResponse.data;

        if (!user) {
          return token;
        }

        token.role = user.role;

        if (account?.provider === 'keycloak') {
          return { ...token, accessToken: account.access_token };
        }
        return token;
      }

      // Handle other response types (pending, partial) - return token without role
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken)
        session.sessionToken = token.accessToken as string;

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        (session.user as any).role = token.role;
      }

      console.log({
        sessionToken: token,
      });

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
