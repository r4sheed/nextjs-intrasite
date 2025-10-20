import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUserByIdWithoutPassword } from '@/features/auth/data/user';
import { verifyUserCredentials } from '@/features/auth/data/user';
import { loginSchema } from '@/features/auth/schemas';
import { ROUTES } from '@/lib/navigation';
import { db } from '@/lib/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        try {
          // Use the new verifyUserCredentials utility
          const user = await verifyUserCredentials(email, password);
          return user;
        } catch (error) {
          // If database error occurs, throw it so it can be handled properly
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      return !!auth;
    },
    async session({ session, token }) {
      if (token.sub) {
        // Fetch the latest user data from the database
        const response = await getUserByIdWithoutPassword(token.sub);
        if (response.status === 'success' && response.data) {
          const user = response.data;
          // Update session with fresh user data
          session.user = {
            ...session.user,
            role: user.role,
          };

          console.log('Updated session user:', session.user);
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
      }

      // Handle session updates from client
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      return token;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: ROUTES.AUTH.LOGIN,
  },
});
