interface RequiredEnv {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

interface OptionalEnv {
  NODE_ENV?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

type Env = RequiredEnv & OptionalEnv;

/**
 * Factory function to create typed environment variables
 */
const createEnv = () => process.env as unknown as Env;

/**
 * Typed environment variables
 */
export const env = createEnv();
