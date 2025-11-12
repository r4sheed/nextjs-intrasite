import type { UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    twoFactorEnabled: boolean;
    isOAuth: boolean;
  }
  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      twoFactorEnabled: boolean;
      isOAuth: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    twoFactorEnabled: boolean;
    isOAuth: boolean;
  }
}
