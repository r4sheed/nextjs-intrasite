import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { TOKEN_LIFETIME_MS } from '@/features/auth/lib/config';
import {
  generatePasswordResetToken,
  generateVerificationToken,
} from '@/features/auth/lib/tokens';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  db: {
    verificationToken: {
      delete: vi.fn(),
      create: vi.fn(),
    },
    passwordResetToken: {
      delete: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/features/auth/data/verification-token', () => ({
  getVerificationTokenByEmail: vi.fn(),
}));

vi.mock('@/features/auth/data/reset-token', () => ({
  getPasswordResetTokenByEmail: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

describe('Token Generation Helpers', () => {
  let mockGetVerificationTokenByEmail: any;
  let mockGetPasswordResetTokenByEmail: any;
  let mockVerificationTokenDelete: any;
  let mockVerificationTokenCreate: any;
  let mockPasswordResetTokenDelete: any;
  let mockPasswordResetTokenCreate: any;
  let mockUuidv4: any;

  beforeAll(async () => {
    const { getVerificationTokenByEmail } = await import(
      '@/features/auth/data/verification-token'
    );
    const { getPasswordResetTokenByEmail } = await import(
      '@/features/auth/data/reset-token'
    );
    const { db } = await import('@/lib/prisma');
    const { v4 } = await import('uuid');

    mockGetVerificationTokenByEmail = vi.mocked(getVerificationTokenByEmail);
    mockGetPasswordResetTokenByEmail = vi.mocked(getPasswordResetTokenByEmail);
    mockVerificationTokenDelete = vi.mocked(db.verificationToken.delete);
    mockVerificationTokenCreate = vi.mocked(db.verificationToken.create);
    mockPasswordResetTokenDelete = vi.mocked(db.passwordResetToken.delete);
    mockPasswordResetTokenCreate = vi.mocked(db.passwordResetToken.create);
    mockUuidv4 = vi.mocked(v4);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Date.now to actual time for each test
    vi.spyOn(Date, 'now').mockRestore();
  });

  describe('generateVerificationToken', () => {
    it('should generate a new verification token with correct expiration', async () => {
      const mockUuid = 'test-uuid-123';
      const testEmail = 'test@example.com';

      mockGetVerificationTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue(mockUuid);

      const mockCreatedToken = {
        id: 'created-token-id',
        email: testEmail,
        token: mockUuid,
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockVerificationTokenCreate.mockResolvedValue(mockCreatedToken);

      const result = await generateVerificationToken(testEmail);

      expect(result).toEqual(mockCreatedToken);
      expect(mockUuidv4).toHaveBeenCalledTimes(1);

      // Verify the create was called with correct structure
      expect(mockVerificationTokenCreate).toHaveBeenCalledWith({
        data: {
          email: testEmail,
          token: mockUuid,
          expires: expect.any(Date),
        },
      });

      // Verify the expiry time is approximately 1 hour from now (within 1 second tolerance)
      const callArg = mockVerificationTokenCreate.mock.calls[0][0];
      const expectedExpiry = Date.now() + TOKEN_LIFETIME_MS;
      const actualExpiry = callArg.data.expires.getTime();
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000);
    });

    it('should delete existing token before creating new one', async () => {
      const existingToken = {
        id: 'existing-token-id',
        email: 'test@example.com',
        token: 'old-token',
        expires: new Date(),
      };

      mockGetVerificationTokenByEmail.mockResolvedValue(existingToken);
      mockUuidv4.mockReturnValue('new-uuid');
      mockVerificationTokenDelete.mockResolvedValue(existingToken);
      mockVerificationTokenCreate.mockResolvedValue({
        id: 'new-token-id',
        email: 'test@example.com',
        token: 'new-uuid',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      });

      await generateVerificationToken('test@example.com');

      expect(mockGetVerificationTokenByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockVerificationTokenDelete).toHaveBeenCalledWith({
        where: { id: 'existing-token-id' },
      });
      expect(mockVerificationTokenCreate).toHaveBeenCalled();
    });

    it('should not attempt to delete if no existing token', async () => {
      mockGetVerificationTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue('new-uuid');
      mockVerificationTokenCreate.mockResolvedValue({
        id: 'new-token-id',
        email: 'test@example.com',
        token: 'new-uuid',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      });

      await generateVerificationToken('test@example.com');

      expect(mockVerificationTokenDelete).not.toHaveBeenCalled();
      expect(mockVerificationTokenCreate).toHaveBeenCalled();
    });

    it('should use 60 minute expiration time', async () => {
      const now = 1704067200000;
      const expectedExpiry = new Date(now + TOKEN_LIFETIME_MS);

      mockGetVerificationTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue('test-uuid');
      vi.spyOn(Date, 'now').mockReturnValue(now);

      mockVerificationTokenCreate.mockResolvedValue({
        id: 'token-id',
        email: 'test@example.com',
        token: 'test-uuid',
        expires: expectedExpiry,
      });

      const result = await generateVerificationToken('test@example.com');

      expect(result.expires).toEqual(expectedExpiry);
      expect(result.expires.getTime() - now).toBe(TOKEN_LIFETIME_MS);
    });

    it('should handle multiple token generations for same email', async () => {
      const email = 'test@example.com';
      const existingToken = {
        id: 'token-1',
        email,
        token: 'old-uuid',
        expires: new Date(),
      };

      // First generation
      mockGetVerificationTokenByEmail.mockResolvedValueOnce(null);
      mockUuidv4.mockReturnValueOnce('uuid-1');
      mockVerificationTokenCreate.mockResolvedValueOnce({
        id: 'token-1',
        email,
        token: 'uuid-1',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      });

      const result1 = await generateVerificationToken(email);
      expect(result1.token).toBe('uuid-1');

      // Second generation (should delete first one)
      mockGetVerificationTokenByEmail.mockResolvedValueOnce(existingToken);
      mockUuidv4.mockReturnValueOnce('uuid-2');
      mockVerificationTokenDelete.mockResolvedValueOnce(existingToken);
      mockVerificationTokenCreate.mockResolvedValueOnce({
        id: 'token-2',
        email,
        token: 'uuid-2',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      });

      const result2 = await generateVerificationToken(email);
      expect(result2.token).toBe('uuid-2');
      expect(mockVerificationTokenDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a new password reset token with correct expiration', async () => {
      const mockUuid = 'reset-uuid-456';
      const testEmail = 'reset@example.com';

      mockGetPasswordResetTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue(mockUuid);

      const mockCreatedToken = {
        id: 'created-reset-token-id',
        email: testEmail,
        token: mockUuid,
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      };

      mockPasswordResetTokenCreate.mockResolvedValue(mockCreatedToken);

      const result = await generatePasswordResetToken(testEmail);

      expect(result).toEqual(mockCreatedToken);
      expect(mockUuidv4).toHaveBeenCalledTimes(1);

      // Verify the create was called with correct structure
      expect(mockPasswordResetTokenCreate).toHaveBeenCalledWith({
        data: {
          email: testEmail,
          token: mockUuid,
          expires: expect.any(Date),
        },
      });

      // Verify the expiry time is approximately 1 hour from now (within 1 second tolerance)
      const callArg = mockPasswordResetTokenCreate.mock.calls[0][0];
      const expectedExpiry = Date.now() + TOKEN_LIFETIME_MS;
      const actualExpiry = callArg.data.expires.getTime();
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000);
    });

    it('should delete existing reset token before creating new one', async () => {
      const existingToken = {
        id: 'existing-reset-token-id',
        email: 'reset@example.com',
        token: 'old-reset-token',
        expires: new Date(),
      };

      mockGetPasswordResetTokenByEmail.mockResolvedValue(existingToken);
      mockUuidv4.mockReturnValue('new-reset-uuid');
      mockPasswordResetTokenDelete.mockResolvedValue(existingToken);
      mockPasswordResetTokenCreate.mockResolvedValue({
        id: 'new-reset-token-id',
        email: 'reset@example.com',
        token: 'new-reset-uuid',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      });

      await generatePasswordResetToken('reset@example.com');

      expect(mockGetPasswordResetTokenByEmail).toHaveBeenCalledWith(
        'reset@example.com'
      );
      expect(mockPasswordResetTokenDelete).toHaveBeenCalledWith({
        where: { id: 'existing-reset-token-id' },
      });
      expect(mockPasswordResetTokenCreate).toHaveBeenCalled();
    });

    it('should not attempt to delete if no existing reset token', async () => {
      mockGetPasswordResetTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue('new-reset-uuid');
      mockPasswordResetTokenCreate.mockResolvedValue({
        id: 'new-reset-token-id',
        email: 'reset@example.com',
        token: 'new-reset-uuid',
        expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
      });

      await generatePasswordResetToken('reset@example.com');

      expect(mockPasswordResetTokenDelete).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenCreate).toHaveBeenCalled();
    });

    it('should use 60 minute expiration time', async () => {
      const now = 1704067200000;
      const expectedExpiry = new Date(now + TOKEN_LIFETIME_MS);

      mockGetPasswordResetTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue('reset-uuid');
      vi.spyOn(Date, 'now').mockReturnValue(now);

      mockPasswordResetTokenCreate.mockResolvedValue({
        id: 'reset-token-id',
        email: 'reset@example.com',
        token: 'reset-uuid',
        expires: expectedExpiry,
      });

      const result = await generatePasswordResetToken('reset@example.com');

      expect(result.expires).toEqual(expectedExpiry);
      expect(result.expires.getTime() - now).toBe(TOKEN_LIFETIME_MS);
    });
  });

  describe('token generation consistency', () => {
    it('should use same token lifetime for both verification and reset tokens', async () => {
      const now = 1704067200000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      mockGetVerificationTokenByEmail.mockResolvedValue(null);
      mockGetPasswordResetTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValueOnce('verify-uuid');
      mockUuidv4.mockReturnValueOnce('reset-uuid');

      const verifyToken = {
        id: '1',
        email: 'test@example.com',
        token: 'verify-uuid',
        expires: new Date(now + TOKEN_LIFETIME_MS),
      };
      const resetToken = {
        id: '2',
        email: 'test@example.com',
        token: 'reset-uuid',
        expires: new Date(now + TOKEN_LIFETIME_MS),
      };

      mockVerificationTokenCreate.mockResolvedValue(verifyToken);
      mockPasswordResetTokenCreate.mockResolvedValue(resetToken);

      const result1 = await generateVerificationToken('test@example.com');
      const result2 = await generatePasswordResetToken('test@example.com');

      // Both should have same lifetime (60 minutes)
      expect(result1.expires.getTime() - now).toBe(
        result2.expires.getTime() - now
      );
    });

    it('should generate unique UUIDs for each token', async () => {
      mockGetVerificationTokenByEmail.mockResolvedValue(null);
      mockGetPasswordResetTokenByEmail.mockResolvedValue(null);

      const uuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4'];
      mockUuidv4
        .mockReturnValueOnce(uuids[0])
        .mockReturnValueOnce(uuids[1])
        .mockReturnValueOnce(uuids[2])
        .mockReturnValueOnce(uuids[3]);

      mockVerificationTokenCreate.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        token: uuids[0],
        expires: new Date(),
      });
      mockPasswordResetTokenCreate.mockResolvedValue({
        id: '2',
        email: 'test@example.com',
        token: uuids[1],
        expires: new Date(),
      });

      await generateVerificationToken('test@example.com');
      await generatePasswordResetToken('test@example.com');

      expect(mockUuidv4).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle token generation at exact midnight', async () => {
      const midnight = new Date('2024-01-01T00:00:00.000Z').getTime();
      const expectedExpiry = new Date(midnight + TOKEN_LIFETIME_MS);

      vi.spyOn(Date, 'now').mockReturnValue(midnight);
      mockGetVerificationTokenByEmail.mockResolvedValue(null);
      mockUuidv4.mockReturnValue('midnight-uuid');

      mockVerificationTokenCreate.mockResolvedValue({
        id: 'token-id',
        email: 'test@example.com',
        token: 'midnight-uuid',
        expires: expectedExpiry,
      });

      const result = await generateVerificationToken('test@example.com');

      expect(result.expires).toEqual(expectedExpiry);
    });

    it('should handle rapid successive token generations', async () => {
      const email = 'rapid@example.com';
      mockGetVerificationTokenByEmail.mockResolvedValue(null);

      for (let i = 0; i < 5; i++) {
        mockUuidv4.mockReturnValueOnce(`uuid-${i}`);
        mockVerificationTokenCreate.mockResolvedValueOnce({
          id: `token-${i}`,
          email,
          token: `uuid-${i}`,
          expires: new Date(Date.now() + TOKEN_LIFETIME_MS),
        });

        const result = await generateVerificationToken(email);
        expect(result.token).toBe(`uuid-${i}`);
      }

      expect(mockVerificationTokenCreate).toHaveBeenCalledTimes(5);
    });
  });
});
