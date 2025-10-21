import { beforeEach, describe, expect, it, vi } from 'vitest';

import { register } from '@/features/auth/actions';
import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { registerUser } from '@/features/auth/services';
import { CoreErrors } from '@/lib/errors/definitions';
import { Status, failure, success } from '@/lib/response';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  registerUser: vi.fn(),
}));

describe('register action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid registration', async () => {
    const mockResponse = success({ userId: 'newuser@example.com' });
    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    const response = await register({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data).toEqual({ userId: 'newuser@example.com' });
      expect(response.data.userId).toBe('newuser@example.com');
    }
  });

  it('should return error for invalid email format', async () => {
    const response = await register({
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_INVALID_FIELDS');
      expect(response.details).toBeDefined();
    }
  });

  it('should return error for missing name', async () => {
    const response = await register({
      name: '',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_INVALID_FIELDS');
      expect(response.details).toBeDefined();
    }
  });

  it('should return error for email already in use', async () => {
    const mockResponse = failure(AuthErrorDefinitions.EMAIL_ALREADY_EXISTS);
    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    const response = await register({
      name: 'Test User',
      email: 'existing@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_EMAIL_ALREADY_EXISTS');
    }
  });

  it('should return error for registration failure', async () => {
    const mockResponse = failure(AuthErrorDefinitions.REGISTRATION_FAILED);
    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    const response = await register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.code).toBe('AUTH_REGISTRATION_FAILED');
    }
  });
});
