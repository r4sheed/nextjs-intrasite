import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { routes } from '@/lib/navigation';
import { db } from '@/lib/prisma';

import {
  deleteTwoFactorConfirmation,
  getTwoFactorConfirmationByUserId,
} from '@/features/auth/data/two-factor-confirmation';
import {
  getUserByEmail,
  verifyUserCredentials,
} from '@/features/auth/data/user';
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

        const { email, password, twoFactorBypass } = parsed.data;

        // Check if user has a TwoFactorConfirmation (bypass password check)
        if (twoFactorBypass) {
          const user = await getUserByEmail(email);
          if (user) {
            const confirmation = await getTwoFactorConfirmationByUserId(
              user.id
            );
            if (confirmation) {
              // User has completed 2FA, allow sign-in without password verification
              return user;
            }
          }
          // If no confirmation found, fall through to normal password verification
        }

        // Normal password verification
        const verifiedUser = await verifyUserCredentials(email, password);
        return verifiedUser;
      },
    }),
  ],
  pages: {
    signIn: routes.auth.login.url,
    error: routes.error.url,
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      // Check if user has completed 2FA verification
      if (user.id) {
        const confirmation = await getTwoFactorConfirmationByUserId(user.id);

        // If 2FA confirmation exists, allow sign-in and delete the confirmation
        if (confirmation) {
          await deleteTwoFactorConfirmation(user.id);
          return true;
        }
      }

      // Allow sign-in for users without 2FA enabled
      return true;
    },
  },
} satisfies NextAuthConfig;
