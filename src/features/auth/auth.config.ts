import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { verifyUserCredentials } from '@/features/auth/data/user';
import { loginSchema } from '@/features/auth/schemas';
import { ROUTES } from '@/lib/navigation';
import { db } from '@/lib/prisma';

export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
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
    signIn: ROUTES.AUTH.LOGIN,
  },
} satisfies NextAuthConfig;
