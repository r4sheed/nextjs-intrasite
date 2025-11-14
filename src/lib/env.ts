import { z } from 'zod';

/**
 * Environment variable validation schema using Zod
 * Provides type-safe access to environment variables with runtime validation
 */

// Schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(url => {
      try {
        const parsedUrl = new URL(url);
        return (
          parsedUrl.protocol === 'postgresql:' ||
          parsedUrl.protocol === 'prisma+postgres:'
        );
      } catch {
        return false;
      }
    }, 'DATABASE_URL must be a valid PostgreSQL or Prisma Accelerate URL'),

  // NextAuth
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters long')
    .refine(
      secret => !secret.includes('your-secret-key-here'),
      'AUTH_SECRET must be set to a real secret, not the placeholder'
    ),

  // NextAuth URL (for callback URLs)
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .optional()
    .default('http://localhost:3000'),

  // Email (Resend)
  RESEND_API_KEY: z
    .string()
    .optional()
    .refine(
      key => !key || key.startsWith('re_'),
      'RESEND_API_KEY must start with "re_" if provided'
    ),

  // Docker/PostgreSQ
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // MinIO
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),

  // Docker Compose
  COMPOSE_PROJECT_NAME: z.string().optional(),

  // Node.js Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Next.js Runtime (used in auth configuration)
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),

  // Test-specific variables
  VITEST_INCLUDE: z.string().optional(),
});

// Type inference from the schema
type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validates environment variables at runtime
 * Throws an error with detailed information if validation fails
 * @returns Validated and typed environment variables
 */
function validateEnv(): EnvSchema {
  // Check if we're in a Node.js environment without dotenv
  const hasEnvVars = process.env.DATABASE_URL && process.env.AUTH_SECRET;

  if (!hasEnvVars && process.env.NODE_ENV !== 'test') {
    console.warn(
      '⚠️  Environment variables not loaded. Make sure .env file exists and dotenv is configured.'
    );
    console.warn(
      "💡 For testing, use: node -p \"require('dotenv').config(); require('./src/lib/env.ts')\""
    );
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues;
    const errorCount = errors.length;

    // Main error message
    console.error(
      `❌ Environment validation failed (${errorCount} issue${errorCount === 1 ? '' : 's'}):`
    );

    // List the specific errors
    errors.forEach(issue => {
      const path = issue.path.join('.');
      console.error(`  • ${path}: ${issue.message}`);
    });

    // Quick hints
    console.log('\n💡 Quick fix:');
    console.log('  1. Copy .env.example to .env');
    console.log('  2. Fill in required values (DATABASE_URL, AUTH_SECRET)');
    console.log('  3. Generate AUTH_SECRET: openssl rand -base64 32');

    throw new Error(
      `Environment validation failed with ${errorCount} error${errorCount === 1 ? '' : 's'}. ` +
        'Please check the configuration guide above and update your .env file.'
    );
  }

  return result.data;
}

/**
 * Validated and type-safe environment variables
 * Use this instead of process.env throughout the application
 *
 * @example
 * import { env } from '@/lib/env';
 *
 * // Instead of: process.env.DATABASE_URL
 * const dbUrl = env.DATABASE_URL;
 */
export const env = validateEnv();

// Export the schema for testing purposes
export { envSchema };
