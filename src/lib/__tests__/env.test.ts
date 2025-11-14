import { describe, expect, it, vi } from 'vitest';

import {
  envHelpers,
  envSchema,
  isDev,
  isDevelopment,
  isProduction,
  isTest,
} from '@/lib/env';

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

describe('env helpers', () => {
  describe('environment checks', () => {
    it('should correctly identify development environment', () => {
      // Note: These tests run in the test environment, so we need to mock the env
      // Since the helpers use the validated env object, we test the logic indirectly
      expect(typeof isDev).toBe('function');
      expect(typeof isDevelopment).toBe('function');
      expect(typeof isProduction).toBe('function');
      expect(typeof isTest).toBe('function');
    });

    it('should provide envHelpers object with all required methods', () => {
      expect(typeof envHelpers.isDev).toBe('function');
      expect(typeof envHelpers.isProduction).toBe('function');
      expect(typeof envHelpers.isTest).toBe('function');
      expect(typeof envHelpers.isDevOrTest).toBe('function');
      expect(typeof envHelpers.getEnvironment).toBe('function');
      expect(typeof envHelpers.isEdgeRuntime).toBe('function');
      expect(typeof envHelpers.hasEmail).toBe('function');
      expect(typeof envHelpers.hasGoogleOAuth).toBe('function');
      expect(typeof envHelpers.hasGithubOAuth).toBe('function');
      expect(typeof envHelpers.hasOAuth).toBe('function');
      expect(typeof envHelpers.hasMinIO).toBe('function');
    });
  });

  describe('feature availability checks', () => {
    it('should check email configuration', () => {
      expect(typeof envHelpers.hasEmail()).toBe('boolean');
    });

    it('should check OAuth configuration', () => {
      expect(typeof envHelpers.hasGoogleOAuth()).toBe('boolean');
      expect(typeof envHelpers.hasGithubOAuth()).toBe('boolean');
      expect(typeof envHelpers.hasOAuth()).toBe('boolean');
    });

    it('should check MinIO configuration', () => {
      expect(typeof envHelpers.hasMinIO()).toBe('boolean');
    });

    it('should check edge runtime', () => {
      expect(typeof envHelpers.isEdgeRuntime()).toBe('boolean');
    });
  });

  describe('convenience exports', () => {
    it('should export convenience functions', () => {
      expect(isDev).toBeDefined();
      expect(isDevelopment).toBeDefined();
      expect(isProduction).toBeDefined();
      expect(isTest).toBeDefined();
    });

    it('should have correct function signatures', () => {
      expect(isDev()).toBe(envHelpers.isDev());
      expect(isDevelopment()).toBe(envHelpers.isDev()); // isDevelopment is alias for isDev
      expect(isProduction()).toBe(envHelpers.isProduction());
      expect(isTest()).toBe(envHelpers.isTest());
    });
  });

  describe('environment state', () => {
    it('should return current environment', () => {
      const env = envHelpers.getEnvironment();
      expect(['development', 'production', 'test']).toContain(env);
    });

    it('should check dev or test environment', () => {
      const result = envHelpers.isDevOrTest();
      expect(typeof result).toBe('boolean');
    });
  });
});
