import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { LoginInput } from '@/features/auth/schemas';

describe('loginUser service', () => {
  beforeEach(() => {
    // Ensure a clean module registry between tests so our doMock calls take effect
    vi.resetModules();
    vi.restoreAllMocks();
    // Prevent importing next-auth's runtime helpers which pull in `next/server`.
    // Provide a minimal default export (NextAuth factory) and AuthError so
    // code that destructures NextAuth(...) and checks instanceof AuthError works.
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
    // Minimal mocks to avoid side-effects during module import
    vi.doMock('@/features/auth/data/user', () => ({
      verifyUserCredentials: vi.fn(),
    }));

    const mod = await import('@/features/auth/services/login-user');

    const result = await mod.loginUser({} as unknown as LoginInput);

    expect(result.status).toBe('error');
    // message code is provided via the AppError -> response.failure mapping
    // The exact code for invalid fields is defined in AUTH_CODES.invalidFields
    const { AUTH_CODES } = await import('@/features/auth/lib/strings');
    if (result.status === 'error') {
      expect(result.code).toBe(AUTH_CODES.invalidFields);
    } else {
      throw new Error('Expected error response');
    }
  });

  it('returns invalidCredentials when verifyUserCredentials returns null', async () => {
    vi.doMock('@/features/auth/data/user', () => ({
      verifyUserCredentials: vi.fn().mockResolvedValue(null),
    }));

    // signIn and other helpers should be mocked to avoid runtime side-effects
    vi.doMock('@/features/auth/lib/auth', () => ({ signIn: vi.fn() }));

    const { loginUser } = await import('@/features/auth/services/login-user');
    const { AUTH_CODES } = await import('@/features/auth/lib/strings');

    const result = await loginUser({
      email: 'noone@example.com',
      password: 'x',
    });

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.code).toBe(AUTH_CODES.invalidCredentials);
    } else {
      throw new Error('Expected error response');
    }
  });

  it('sends verification email and returns success when account unverified and emailVerification enabled', async () => {
    // Mock data layer to return an unverified user
    vi.doMock('@/features/auth/data/user', () => ({
      verifyUserCredentials: vi
        .fn()
        .mockResolvedValue({ id: 'user-1', emailVerified: false }),
    }));

    // Mock token generator
    const mockToken = { email: 'user-1@example.com', token: 'tok-123' };
    vi.doMock('@/features/auth/lib/tokens', () => ({
      generateVerificationToken: vi.fn().mockResolvedValue(mockToken),
    }));

    // Mock mail sender and signIn (should not be called)
    const sendVerificationEmail = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/features/auth/lib/mail', () => ({ sendVerificationEmail }));
    vi.doMock('@/features/auth/lib/auth', () => ({ signIn: vi.fn() }));

    const { loginUser } = await import('@/features/auth/services/login-user');
    const { AUTH_SUCCESS } = await import('@/features/auth/lib/strings');

    const result = await loginUser({
      email: 'user-1@example.com',
      password: 'pw',
    });

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.data).toEqual({ userId: 'user-1' });
      expect(result.message?.key).toBe(AUTH_SUCCESS.verificationSent);
    }

    // Ensure token generation and email sending occurred
    const tokens = await import('@/features/auth/lib/tokens');
    expect(tokens.generateVerificationToken).toHaveBeenCalledWith(
      'user-1@example.com'
    );
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      mockToken.email,
      mockToken.token
    );
  });

  it('calls signIn and returns success for verified accounts', async () => {
    vi.doMock('@/features/auth/data/user', () => ({
      verifyUserCredentials: vi
        .fn()
        .mockResolvedValue({ id: 'user-2', emailVerified: true }),
    }));

    const signIn = vi.fn().mockResolvedValue({});
    vi.doMock('@/features/auth/lib/auth', () => ({ signIn }));

    const { loginUser } = await import('@/features/auth/services/login-user');

    const result = await loginUser({
      email: 'user-2@example.com',
      password: 'pw',
    });

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.data).toEqual({ userId: 'user-2' });
    }

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user-2@example.com',
      password: 'pw',
      redirect: false,
    });
  });
});
