import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { env, envHelpers } from '@/lib/env';
import { db } from '@/lib/prisma';
import { routes } from '@/lib/routes';

import { getTwoFactorConfirmationByUserId } from '@/features/auth/data';
import { getUserByEmail, verifyUserCredentials } from '@/features/auth/data';
import { loginSchema } from '@/features/auth/schemas';

// Build providers array conditionally based on available environment variables
const providers = [
  // Only include Google provider if credentials are available
  ...(envHelpers.hasGoogleOAuth()
    ? [
        Google({
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : []),
  // Only include GitHub provider if credentials are available
  ...(envHelpers.hasGithubOAuth()
    ? [
        Github({
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        }),
      ]
    : []),

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
          const confirmation = await getTwoFactorConfirmationByUserId(user.id);
          if (confirmation) {
            // User has completed 2FA, allow sign-in without password verification
            // Note: TwoFactorConfirmation will be deleted in the signIn callback
            return {
              ...user,
              isOAuthAccount: false,
            };
          }
        }
        // If no confirmation found, fall through to normal password verification
      }

      // Normal password verification
      const verifiedUser = await verifyUserCredentials(email, password);
      return verifiedUser;
    },
  }),
];

export const authConfig = {
  adapter: PrismaAdapter(db),
  providers,
  pages: {
    signIn: routes.auth.login.url,
    error: routes.error.url,
  },
  session: { strategy: 'jwt' },
};
