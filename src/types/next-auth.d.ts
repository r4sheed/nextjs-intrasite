import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role?: string;
    };
  }

  interface User {
    role?: string;
  }
}
