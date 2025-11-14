import { describe, expect, it } from 'vitest';

import { validateEnv } from '../validate-env';

const goodEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb',
  AUTH_SECRET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef',
  NEXTAUTH_URL: 'http://localhost:3000',
  RESEND_API_KEY: 're_test',
};

const missingDatabase = {
  AUTH_SECRET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef',
  NEXTAUTH_URL: 'http://localhost:3000',
};

const badResend = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb',
  AUTH_SECRET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef',
  NEXTAUTH_URL: 'http://localhost:3000',
  RESEND_API_KEY: 'not-starting-with-re',
};

describe('validateEnv script', () => {
  it('validates correct environment variables', async () => {
    await expect(
      validateEnv(goodEnv as unknown as NodeJS.ProcessEnv)
    ).resolves.toBeDefined();
  });

  it('fails if DATABASE_URL missing', async () => {
    await expect(
      validateEnv(missingDatabase as unknown as NodeJS.ProcessEnv)
    ).rejects.toThrow();
  });

  it('fails if RESEND_API_KEY has invalid format', async () => {
    await expect(
      validateEnv(badResend as unknown as NodeJS.ProcessEnv)
    ).rejects.toThrow();
  });
});
