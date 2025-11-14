/**
 * Environment variables with type safety
 */

// Required environment variables
interface RequiredEnv {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

// Optional environment variables
interface OptionalEnv {
  RESEND_API_KEY?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  MINIO_ROOT_USER?: string;
  MINIO_ROOT_PASSWORD?: string;
  COMPOSE_PROJECT_NAME?: string;
  NODE_ENV?: string;
  NEXT_RUNTIME?: string;
  VITEST_INCLUDE?: string;
}

// Combined environment type (all optional for runtime safety)
type EnvSchema = Partial<RequiredEnv> & OptionalEnv;

/**
 * Type-safe environment variables
 * Direct access to process.env with TypeScript typing
 */
export const env = process.env as EnvSchema;

/**
 * Environment helper functions for common checks
 */
export const envHelpers = {
  /**
   * Check if running in development environment
   */
  isDev: () => env.NODE_ENV === 'development',

  /**
   * Check if running in production environment
   */
  isProduction: () => env.NODE_ENV === 'production',

  /**
   * Check if running in test environment
   */
  isTest: () => env.NODE_ENV === 'test',

  /**
   * Check if running in development or test environment
   */
  isDevOrTest: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',

  /**
   * Get current environment name with fallback
   */
  getEnvironment: () => env.NODE_ENV || 'development',

  /**
   * Check if Next.js is running on Edge Runtime
   */
  isEdgeRuntime: () => env.NEXT_RUNTIME === 'edge',

  /**
   * Check if email service is configured
   */
  hasEmail: () => !!env.RESEND_API_KEY,

  /**
   * Check if Google OAuth is fully configured
   */
  hasGoogleOAuth: () => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),

  /**
   * Check if GitHub OAuth is fully configured
   */
  hasGithubOAuth: () => !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),

  /**
   * Check if any OAuth provider is configured
   */
  hasOAuth: () => envHelpers.hasGoogleOAuth() || envHelpers.hasGithubOAuth(),

  /**
   * Check if MinIO is configured
   */
  hasMinIO: () => !!(env.MINIO_ROOT_USER && env.MINIO_ROOT_PASSWORD),
} as const;

// Convenience exports for easier importing
export const {
  isDev,
  isProduction,
  isTest,
  isDevOrTest,
  getEnvironment,
  isEdgeRuntime,
  hasEmail,
  hasGoogleOAuth,
  hasGithubOAuth,
  hasOAuth,
  hasMinIO,
} = envHelpers;

// Export types for use in other files
export type { EnvSchema };

/**
 * Lazily builds Zod validation schema for environment variables.
 * This function dynamically imports Zod so the library is only loaded
 * when validation is explicitly needed (e.g., build-time script).
 *
 * Important: Do NOT call this from client-side code — it loads `zod`
 * and is intended for server-only build-time checks.
 */
export const getEnvValidationSchema = async () => {
  const { z } = await import('zod');

  return z.object({
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine(url => {
        try {
          const parsed = new URL(url);
          return (
            parsed.protocol === 'postgresql:' ||
            parsed.protocol === 'prisma+postgres:'
          );
        } catch {
          return false;
        }
      }, 'DATABASE_URL must be a valid PostgreSQL or Prisma Accelerate URL'),

    AUTH_SECRET: z
      .string()
      .min(32, 'AUTH_SECRET must be at least 32 characters long')
      .refine(
        secret => !secret.includes('your-secret-key-here'),
        'AUTH_SECRET must not contain the placeholder value'
      ),

    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),

    RESEND_API_KEY: z
      .string()
      .optional()
      .refine(
        key => !key || key.startsWith('re_'),
        'RESEND_API_KEY must start with "re_"'
      ),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    MINIO_ROOT_USER: z.string().optional(),
    MINIO_ROOT_PASSWORD: z.string().optional(),

    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  });
};
