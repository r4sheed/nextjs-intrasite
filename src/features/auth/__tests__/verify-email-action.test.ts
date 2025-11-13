import { beforeEach, describe, expect, it, vi } from 'vitest';

import { response as responseFactory, Status } from '@/lib/response';

import { verifyEmail as verifyEmailAction } from '@/features/auth/actions';
import {
  tokenExpired,
  tokenNotFound,
  userNotFound,
} from '@/features/auth/lib/errors';
import { AUTH_CODES, AUTH_SUCCESS } from '@/features/auth/lib/strings';
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
      message: { key: AUTH_SUCCESS.emailVerified },
    });
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction({
      email: 'user@example.com',
      token: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.message?.key).toBe(AUTH_SUCCESS.emailVerified);
    }
    expect(verifyEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
      token: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('should return error for empty token', async () => {
    const response = await verifyEmailAction({
      email: 'user@example.com',
      token: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('validation-failed');
    }
    // Service should not be called for empty token
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('should return error for null/undefined token', async () => {
    const response = await verifyEmailAction({
      email: 'user@example.com',
      token: '',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('validation-failed');
    }
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it('should return error for non-existent token', async () => {
    const mockResponse = responseFactory.failure(tokenNotFound());
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction({
      email: 'user@example.com',
      token: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.tokenInvalid);
    }
  });

  it('should return error for expired token', async () => {
    const mockResponse = responseFactory.failure(tokenExpired('expired-token'));
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction({
      email: 'user@example.com',
      token: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.tokenExpired);
    }
  });

  it('should return error when user not found', async () => {
    const mockResponse = responseFactory.failure(
      userNotFound('test@example.com')
    );
    vi.mocked(verifyEmail).mockResolvedValue(mockResponse);

    const response = await verifyEmailAction({
      email: 'test@example.com',
      token: '550e8400-e29b-41d4-a716-446655440003', // Valid UUID
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe(AUTH_CODES.userNotFound);
    }
  });
});
