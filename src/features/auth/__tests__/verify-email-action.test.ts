import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';

import { verifyEmail as verifyEmailAction } from '@/features/auth/actions';
import { verifyEmail } from '@/features/auth/services';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  verifyEmail: vi.fn(),
}));

describe('verifyEmail action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid token', async () => {
    const mockResponse = responseFactory.success({
      data: {},
      message: { key: 'auth.success.email_verified' },
    });
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction('valid-token-123');

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.message?.key).toBe('auth.success.email_verified');
    }
    expect(verifyEmail).toHaveBeenCalledWith('valid-token-123');
  });

  it('should return error for empty token', async () => {
    const response = await verifyEmailAction('');

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_TOKEN_NOT_FOUND');
    }
    // Service should not be called for empty token
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('should return error for null/undefined token', async () => {
    const response = await verifyEmailAction(null as any);

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_TOKEN_NOT_FOUND');
    }
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('should return error for non-existent token', async () => {
    const mockResponse = responseFactory.failure(tokenNotFound());
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction('nonexistent-token');

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_TOKEN_NOT_FOUND');
    }
  });

  it('should return error for expired token', async () => {
    const mockResponse = responseFactory.failure(tokenExpired('expired-token'));
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction('expired-token');

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_TOKEN_EXPIRED');
    }
  });

  it('should return error when user not found', async () => {
    const mockResponse = responseFactory.failure(
      userNotFound('test@example.com')
    );
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction('valid-token-123');

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_USER_NOT_FOUND');
    }
  });
});
