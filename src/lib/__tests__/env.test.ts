import { describe, expect, it } from 'vitest';

import { envSchema } from '@/lib/env';

describe('env validation', () => {
  describe('valid configuration', () => {
    it('should validate successfully with all required variables', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.DATABASE_URL).toBe(
          'postgresql://user:pass@localhost:5432/db'
        );
        expect(result.data.AUTH_SECRET).toBe(
          'valid-secret-key-at-least-32-chars-long'
        );
        expect(result.data.NODE_ENV).toBe('development');
      }
    });

    it('should validate successfully with Prisma Accelerate URL', () => {
      const env = {
        DATABASE_URL:
          'prisma+postgres://accelerate.prisma-data.net/?api_key=test_key',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'production',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.DATABASE_URL).toBe(
          'prisma+postgres://accelerate.prisma-data.net/?api_key=test_key'
        );
        expect(result.data.NODE_ENV).toBe('production');
      }
    });

    it('should handle optional variables correctly', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
        RESEND_API_KEY: 're_test_123',
        GOOGLE_CLIENT_ID: 'test-client-id',
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.RESEND_API_KEY).toBe('re_test_123');
        expect(result.data.GOOGLE_CLIENT_ID).toBe('test-client-id');
        expect(result.data.GOOGLE_CLIENT_SECRET).toBeUndefined();
      }
    });

    it('should default NODE_ENV to development', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        // PostgreSQL variables are now optional
        // NODE_ENV not set
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('development');
      }
    });
  });

  describe('invalid configuration', () => {
    it('should reject missing DATABASE_URL', () => {
      const env = {
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it('should reject missing AUTH_SECRET', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it('should reject invalid DATABASE_URL format', () => {
      const env = {
        DATABASE_URL: 'invalid-url',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it('should reject AUTH_SECRET too short', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'short',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it('should reject placeholder AUTH_SECRET', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'your-secret-key-here',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it('should reject invalid NODE_ENV', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'invalid-env',
        // PostgreSQL variables are now optional
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });

    it('should reject invalid RESEND_API_KEY format', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'development',
        // PostgreSQL variables are now optional
        RESEND_API_KEY: 'invalid-key',
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should export properly typed env object', () => {
      const env = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        AUTH_SECRET: 'valid-secret-key-at-least-32-chars-long',
        NODE_ENV: 'test' as const,
        // PostgreSQL variables are now optional
        // RESEND_API_KEY not set
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        // Type checks - these should not cause TypeScript errors
        const dbUrl: string = result.data.DATABASE_URL;
        const authSecret: string = result.data.AUTH_SECRET;
        const nodeEnv: 'development' | 'production' | 'test' =
          result.data.NODE_ENV;
        const resendKey: string | undefined = result.data.RESEND_API_KEY;

        expect(typeof dbUrl).toBe('string');
        expect(typeof authSecret).toBe('string');
        expect(['development', 'production', 'test']).toContain(nodeEnv);
        expect(resendKey).toBeUndefined();
      }
    });
  });
});
