import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TWO_FACTOR_MAX_ATTEMPTS } from '@/features/auth/lib/config';
import { AUTH_CODES } from '@/features/auth/lib/strings';

import type { TwoFactorToken } from '@prisma/client';

const buildToken = (
  overrides: Partial<TwoFactorToken> = {}
): TwoFactorToken => ({
  id: 'token-1',
  userId: 'user-1',
  token: '123456',
  attempts: 0,
  expires: new Date(Date.now() + 5 * 60 * 1000),
  createdAt: new Date(),
  ...overrides,
});

describe('verifyTwoFactorCode service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('increments attempts and returns invalid code when token mismatch', async () => {
    const getTwoFactorTokenById = vi
      .fn()
      .mockResolvedValue(buildToken({ token: '654321' }));
    const incrementTwoFactorAttempts = vi.fn();

    vi.doMock('@/features/auth/data/two-factor-token', () => ({
      getTwoFactorTokenById,
      deleteTwoFactorToken: vi.fn(),
      incrementTwoFactorAttempts,
    }));

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'user@example.com' }),
    }));

    vi.doMock('@/features/auth/data/two-factor-confirmation', () => ({
      createTwoFactorConfirmation: vi.fn(),
    }));

    const { verifyTwoFactorCode } = await import(
      '@/features/auth/services/verify-two-factor'
    );
    const { Status } = await import('@/lib/response');

    const result = await verifyTwoFactorCode('token-1', '123456');

    expect(result.status).toBe(Status.Error);
    if (result.status === Status.Error) {
      expect(result.code).toBe(AUTH_CODES.twoFactorCodeInvalid);
    }
    expect(incrementTwoFactorAttempts).toHaveBeenCalledWith('token-1');
  });

  it('deletes token and returns max attempts when limit reached', async () => {
    const token = buildToken({ attempts: TWO_FACTOR_MAX_ATTEMPTS });
    const getTwoFactorTokenById = vi.fn().mockResolvedValue(token);
    const deleteTwoFactorToken = vi.fn();

    vi.doMock('@/features/auth/data/two-factor-token', () => ({
      getTwoFactorTokenById,
      deleteTwoFactorToken,
      incrementTwoFactorAttempts: vi.fn(),
    }));

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'user@example.com' }),
    }));

    vi.doMock('@/features/auth/data/two-factor-confirmation', () => ({
      createTwoFactorConfirmation: vi.fn(),
    }));

    const { verifyTwoFactorCode } = await import(
      '@/features/auth/services/verify-two-factor'
    );
    const { Status } = await import('@/lib/response');

    const result = await verifyTwoFactorCode('token-1', '123456');

    expect(result.status).toBe(Status.Error);
    if (result.status === Status.Error) {
      expect(result.code).toBe(AUTH_CODES.twoFactorMaxAttempts);
    }
    expect(deleteTwoFactorToken).toHaveBeenCalledWith('token-1');
  });

  it('removes expired tokens and reports expiration', async () => {
    const expiredToken = buildToken({ expires: new Date(Date.now() - 1000) });
    const getTwoFactorTokenById = vi.fn().mockResolvedValue(expiredToken);
    const deleteTwoFactorToken = vi.fn();

    vi.doMock('@/features/auth/data/two-factor-token', () => ({
      getTwoFactorTokenById,
      deleteTwoFactorToken,
      incrementTwoFactorAttempts: vi.fn(),
    }));

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'user@example.com' }),
    }));

    vi.doMock('@/features/auth/data/two-factor-confirmation', () => ({
      createTwoFactorConfirmation: vi.fn(),
    }));

    const { verifyTwoFactorCode } = await import(
      '@/features/auth/services/verify-two-factor'
    );
    const { Status } = await import('@/lib/response');

    const result = await verifyTwoFactorCode('token-1', '123456');

    expect(result.status).toBe(Status.Error);
    if (result.status === Status.Error) {
      expect(result.code).toBe(AUTH_CODES.twoFactorCodeExpired);
    }
    expect(deleteTwoFactorToken).toHaveBeenCalledWith('token-1');
  });

  it('creates confirmation and deletes token on success', async () => {
    const token = buildToken();
    const getTwoFactorTokenById = vi.fn().mockResolvedValue(token);
    const deleteTwoFactorToken = vi.fn();
    const createTwoFactorConfirmation = vi.fn();

    vi.doMock('@/features/auth/data/two-factor-token', () => ({
      getTwoFactorTokenById,
      deleteTwoFactorToken,
      incrementTwoFactorAttempts: vi.fn(),
    }));

    vi.doMock('@/features/auth/data/user', () => ({
      getUserById: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      }),
    }));

    vi.doMock('@/features/auth/data/two-factor-confirmation', () => ({
      createTwoFactorConfirmation,
    }));

    const { verifyTwoFactorCode } = await import(
      '@/features/auth/services/verify-two-factor'
    );
    const { Status } = await import('@/lib/response');

    const result = await verifyTwoFactorCode('token-1', '123456');

    expect(result.status).toBe(Status.Success);
    if (result.status === Status.Success) {
      expect(result.data?.verified).toBe(true);
      expect(result.data?.userId).toBe('user-1');
    }
    expect(deleteTwoFactorToken).toHaveBeenCalledWith('token-1');
    expect(createTwoFactorConfirmation).toHaveBeenCalledWith('user-1');
  });
});
