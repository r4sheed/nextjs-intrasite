import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { PrismaAdapter } from '@auth/prisma-adapter';

import { routes } from '@/lib/navigation';
import { db } from '@/lib/prisma';

import { verifyUserCredentials } from '@/features/auth/data/user';

import { loginSchema } from '@/features/auth/schemas';

export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        try {
          const user = await verifyUserCredentials(email, password);
          return user;
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: routes.auth.login.url,
    error: routes.error.url,
  },
  session: { strategy: 'jwt' },
} satisfies NextAuthConfig;
