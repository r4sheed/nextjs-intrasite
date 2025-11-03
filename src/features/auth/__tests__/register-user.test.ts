import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { RegisterInput } from '@/features/auth/schemas';

describe('registerUser service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    // Minimal next-auth mock to avoid pulling next/server in tests
    vi.doMock('next-auth', () => {
      const signIn = vi.fn();
      const signOut = vi.fn();
      return {
        default: () => ({ auth: {}, handlers: {}, signIn, signOut }),
        AuthError: class AuthError extends Error {
          constructor(public type?: string) {
            super(type);
          }
        },
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns invalidFields for malformed input', async () => {
    vi.doMock('@/features/auth/data/user', () => ({ getUserByEmail: vi.fn() }));

    const mod = await import('@/features/auth/services/register-user');

    const result = await mod.registerUser({} as unknown as RegisterInput);

    expect(result.status).toBe('error');
    const { AUTH_CODES } = await import('@/features/auth/lib/strings');
    if (result.status === 'error') {
      expect(result.code).toBe(AUTH_CODES.invalidFields);
    } else {
      throw new Error('Expected error response');
    }
  });

  it('returns emailAlreadyExists when user already exists', async () => {
    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue({ id: 'exists' }),
    }));

    const { registerUser } = await import(
      '@/features/auth/services/register-user'
    );
    const { AUTH_CODES } = await import('@/features/auth/lib/strings');

    const result = await registerUser({
      email: 'existing@example.com',
      password: 'password',
      name: 'Name',
    });

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.code).toBe(AUTH_CODES.emailExists);
    }
  });

  it('creates user, sends verification email when emailVerification enabled', async () => {
    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: { hashPassword: vi.fn().mockResolvedValue('hashed-pw') },
    }));

    const created = { id: 'new-user' };
    vi.doMock('@/lib/prisma', () => ({
      db: { user: { create: vi.fn().mockResolvedValue(created) } },
    }));

    const mockToken = { email: 'new@example.com', token: 't-1' };
    vi.doMock('@/features/auth/lib/tokens', () => ({
      generateVerificationToken: vi.fn().mockResolvedValue(mockToken),
    }));

    const sendVerificationEmail = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/features/auth/lib/mail', () => ({ sendVerificationEmail }));

    const { registerUser } = await import(
      '@/features/auth/services/register-user'
    );
    const { AUTH_SUCCESS } = await import('@/features/auth/lib/strings');

    const result = await registerUser({
      email: 'new@example.com',
      password: 'password',
      name: 'New',
    });

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.data).toEqual({ userId: created.id });
      expect(result.message?.key).toBe(AUTH_SUCCESS.verificationSent);
    }

    const tokens = await import('@/features/auth/lib/tokens');
    expect(tokens.generateVerificationToken).toHaveBeenCalledWith(
      'new@example.com'
    );
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      mockToken.email,
      mockToken.token
    );
  });

  it('creates user and signs in when emailVerification disabled', async () => {
    // Override siteFeatures to disable emailVerification
    vi.doMock('@/lib/config', () => ({
      siteFeatures: { socialAuth: true, emailVerification: false },
    }));

    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/features/auth/models', () => ({
      User: { hashPassword: vi.fn().mockResolvedValue('hashed-pw') },
    }));

    const created = { id: 'new-user-2' };
    vi.doMock('@/lib/prisma', () => ({
      db: { user: { create: vi.fn().mockResolvedValue(created) } },
    }));

    const signIn = vi.fn().mockResolvedValue({});
    vi.doMock('@/features/auth/lib/auth', () => ({ signIn }));

    const { registerUser } = await import(
      '@/features/auth/services/register-user'
    );

    const result = await registerUser({
      email: 'new2@example.com',
      password: 'password',
      name: 'New',
    });

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.data).toEqual({ userId: created.id });
    }

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'new2@example.com',
      password: 'password',
      redirect: false,
    });
  });
});
