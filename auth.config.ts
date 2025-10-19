import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { verifyUserCredentials } from '@/features/auth/data/user';
import { loginSchema } from '@/features/auth/schemas';

export default {
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
} satisfies NextAuthConfig;
