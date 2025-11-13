import { UserRole } from '@prisma/client';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { auth } from '@/features/auth/lib/auth';
import {
  currentUser,
  hasRole,
  isAuthenticated,
  requireAuth,
} from '@/features/auth/lib/auth-utils';

import type { Session } from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAuth = auth as any;

// Mock the auth function
vi.mock('@/features/auth/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('auth utilities', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockAuth.mockReset();
  });

  describe('currentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        isOAuthAccount: false,
        twoFactorEnabled: false,
      };

      const mockSession: Session = {
        user: mockUser,
        expires: '2025-12-31',
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await currentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await currentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user exists', async () => {
      const mockSession: Session = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: UserRole.USER,
          isOAuthAccount: false,
          twoFactorEnabled: false,
        },
        expires: '2025-12-31',
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no user', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has matching role', async () => {
      const mockSession: Session = {
        user: {
          id: '123',
          role: UserRole.ADMIN,
          isOAuthAccount: false,
          twoFactorEnabled: false,
        },
        expires: '2025-12-31',
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await hasRole('ADMIN');

      expect(result).toBe(true);
    });

    it('should return false when user has different role', async () => {
      const mockSession: Session = {
        user: {
          id: '123',
          role: UserRole.USER,
          isOAuthAccount: false,
          twoFactorEnabled: false,
        },
        expires: '2025-12-31',
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await hasRole('ADMIN');

      expect(result).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await hasRole('ADMIN');

      expect(result).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: UserRole.USER,
        isOAuthAccount: false,
        twoFactorEnabled: false,
      };
      const mockSession: Session = {
        user: mockUser,
        expires: '2025-12-31',
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result).toEqual(mockUser);
    });

    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });

    it('should throw custom error message', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(requireAuth('Custom message')).rejects.toThrow(
        'Custom message'
      );
    });
  });
});
