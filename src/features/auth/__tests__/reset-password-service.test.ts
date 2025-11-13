import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('resetPassword service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns userNotFound error when user does not exist', async () => {
    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock('@/lib/config', () => ({
      siteFeatures: { emailVerification: true },
    }));

    const { resetPassword } = await import(
      '@/features/auth/services/reset-password'
    );
    const { AUTH_CODES } = await import('@/features/auth/lib/strings');

    const result = await resetPassword({
      email: 'nonexistent@example.com',
    });

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.code).toBe(AUTH_CODES.userNotFound);
    } else {
      throw new Error('Expected error response');
    }
  });

  it('returns emailVerificationRequiredForPasswordReset error when user exists but email is not verified', async () => {
    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        emailVerified: false,
      }),
    }));

    vi.doMock('@/lib/config', () => ({
      siteFeatures: { emailVerification: true },
    }));

    const { resetPassword } = await import(
      '@/features/auth/services/reset-password'
    );
    const { AUTH_CODES } = await import('@/features/auth/lib/strings');

    const result = await resetPassword({
      email: 'user@example.com',
    });

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.code).toBe(AUTH_CODES.verificationRequiredForPasswordReset);
    } else {
      throw new Error('Expected error response');
    }
  });

  it('sends password reset email and returns success when user exists and email is verified', async () => {
    const mockUser = {
      id: 'user-2',
      email: 'verified@example.com',
      emailVerified: true,
    };

    const mockToken = {
      email: 'verified@example.com',
      token: 'reset-token-123',
    };

    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(mockUser),
    }));

    vi.doMock('@/lib/config', () => ({
      siteFeatures: { emailVerification: true },
    }));

    vi.doMock('@/features/auth/lib/tokens', () => ({
      generatePasswordResetToken: vi.fn().mockResolvedValue(mockToken),
    }));

    const sendResetPasswordEmail = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/features/auth/lib/mail', () => ({
      sendResetPasswordEmail,
    }));

    const { resetPassword } = await import(
      '@/features/auth/services/reset-password'
    );
    const { AUTH_SUCCESS } = await import('@/features/auth/lib/strings');

    const result = await resetPassword({
      email: 'verified@example.com',
    });

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.message?.key).toBe(AUTH_SUCCESS.passwordResetSent);
    } else {
      throw new Error('Expected success response');
    }

    // Verify token generation and email sending
    const tokens = await import('@/features/auth/lib/tokens');
    expect(tokens.generatePasswordResetToken).toHaveBeenCalledWith(
      mockUser.email
    );

    expect(sendResetPasswordEmail).toHaveBeenCalledWith(
      mockToken.email,
      mockToken.token
    );
  });

  it('skips email verification check when siteFeatures.emailVerification is disabled', async () => {
    const mockUser = {
      id: 'user-3',
      email: 'unverified@example.com',
      emailVerified: false,
    };

    const mockToken = {
      email: 'unverified@example.com',
      token: 'reset-token-456',
    };

    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(mockUser),
    }));

    vi.doMock('@/lib/config', () => ({
      siteFeatures: { emailVerification: false },
    }));

    vi.doMock('@/features/auth/lib/tokens', () => ({
      generatePasswordResetToken: vi.fn().mockResolvedValue(mockToken),
    }));

    const sendResetPasswordEmail = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/features/auth/lib/mail', () => ({
      sendResetPasswordEmail,
    }));

    const { resetPassword } = await import(
      '@/features/auth/services/reset-password'
    );
    const { AUTH_SUCCESS } = await import('@/features/auth/lib/strings');

    const result = await resetPassword({
      email: 'unverified@example.com',
    });

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.message?.key).toBe(AUTH_SUCCESS.passwordResetSent);
    } else {
      throw new Error('Expected success response');
    }

    // Verify email was sent even though user is unverified
    expect(sendResetPasswordEmail).toHaveBeenCalledWith(
      mockToken.email,
      mockToken.token
    );
  });

  it('handles errors during token generation', async () => {
    const mockUser = {
      id: 'user-4',
      email: 'error@example.com',
      emailVerified: true,
    };

    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(mockUser),
    }));

    vi.doMock('@/lib/config', () => ({
      siteFeatures: { emailVerification: true },
    }));

    vi.doMock('@/features/auth/lib/tokens', () => ({
      generatePasswordResetToken: vi
        .fn()
        .mockRejectedValue(new Error('Token generation failed')),
    }));

    const { resetPassword } = await import(
      '@/features/auth/services/reset-password'
    );
    const { CORE_CODES } = await import('@/lib/errors/codes');

    const result = await resetPassword({
      email: 'error@example.com',
    });

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.code).toBe(CORE_CODES.internalServerError);
    } else {
      throw new Error('Expected error response');
    }
  });

  it('handles errors during email sending', async () => {
    const mockUser = {
      id: 'user-5',
      email: 'email-error@example.com',
      emailVerified: true,
    };

    const mockToken = {
      email: 'email-error@example.com',
      token: 'reset-token-789',
    };

    vi.doMock('@/features/auth/data/user', () => ({
      getUserByEmail: vi.fn().mockResolvedValue(mockUser),
    }));

    vi.doMock('@/lib/config', () => ({
      siteFeatures: { emailVerification: true },
    }));

    vi.doMock('@/features/auth/lib/tokens', () => ({
      generatePasswordResetToken: vi.fn().mockResolvedValue(mockToken),
    }));

    vi.doMock('@/features/auth/lib/mail', () => ({
      sendResetPasswordEmail: vi
        .fn()
        .mockRejectedValue(new Error('Email sending failed')),
    }));

    const { resetPassword } = await import(
      '@/features/auth/services/reset-password'
    );
    const { CORE_CODES } = await import('@/lib/errors/codes');

    const result = await resetPassword({
      email: 'email-error@example.com',
    });

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.code).toBe(CORE_CODES.internalServerError);
    } else {
      throw new Error('Expected error response');
    }
  });
});
