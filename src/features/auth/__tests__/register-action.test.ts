import { beforeEach, describe, expect, it, vi } from 'vitest';

import { register } from '@/features/auth/actions';
import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { registerUser } from '@/features/auth/services';
import { Status } from '@/lib/response';

// Mock the service layer
vi.mock('@/features/auth/services', () => ({
  registerUser: vi.fn(),
}));

describe('register action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid registration', async () => {
    const mockUser = { userId: 'newuser@example.com' };
    vi.mocked(registerUser).mockResolvedValue(mockUser);

    const response = await register({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data).toEqual(mockUser);
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
      expect(response.error.code).toBe('AUTH_INVALID_FIELDS');
      expect(response.error.details).toBeDefined();
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
      expect(response.error.code).toBe('AUTH_INVALID_FIELDS');
      expect(response.error.details).toBeDefined();
    }
  });

  it('should return error for email already in use', async () => {
    vi.mocked(registerUser).mockRejectedValue(
      AuthErrorDefinitions.EMAIL_IN_USE
    );

    const response = await register({
      name: 'Test User',
      email: 'existing@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.error.code).toBe('AUTH_EMAIL_IN_USE');
    }
  });

  it('should return error for registration failure', async () => {
    vi.mocked(registerUser).mockRejectedValue(
      AuthErrorDefinitions.REGISTRATION_FAILED
    );

    const response = await register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.error.code).toBe('AUTH_REGISTRATION_FAILED');
    }
  });
});
