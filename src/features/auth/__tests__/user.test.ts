import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getUser,
  getUserByEmail,
  getUserById,
  getUserData,
  verifyUserCredentials,
} from '@/features/auth/data/user';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('User Data Layer', () => {
  let mockFindUnique: ReturnType<typeof vi.fn>;
  let mockBcryptCompare: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    const { db } = await import('@/lib/prisma');
    mockFindUnique = vi.mocked(db.user.findUnique);
    const { default: bcrypt } = await import('bcryptjs');
    mockBcryptCompare = vi.mocked(bcrypt.compare);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('returns user data without password by default', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      };

      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await getUserById('user-123');

      expect(response).toEqual(mockUser);
      expect(response).not.toHaveProperty('password');
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          twoFactorEnabled: true,
        },
      });
    });

    it('returns user with password when explicitly requested', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      };

      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await getUserById('user-123', {
        includePassword: true,
      });

      expect(response).toEqual(mockUser);
      expect(response?.password).toBe('hashedpassword');
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('returns null when user does not exist', async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const response = await getUserById('nonexistent-user');

      expect(response).toBeNull();
    });

    it('returns null when database lookup fails', async () => {
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValueOnce(dbError);

      const response = await getUserById('user-123');

      expect(response).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return success with user data when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockUser);

      const response = await getUserByEmail('test@example.com');

      expect(response).toEqual(mockUser);
      expect(response?.email).toBe('test@example.com');
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return success with null when user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const response = await getUserByEmail('nonexistent@example.com');

      expect(response).toBeNull();
    });
  });

  describe('getUser (unified function)', () => {
    it('should prioritize ID over email when both provided', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await getUser({
        id: 'user-123',
        email: 'test@example.com',
        includePassword: true,
      });

      expect(response).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should use email when no ID provided', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await getUser({
        email: 'test@example.com',
        includePassword: true,
      });

      expect(response).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return user without password when includePassword is false', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      };

      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await getUser({
        id: 'user-123',
        includePassword: false,
      });

      expect(response).toEqual(mockUser);
      expect(response).not.toHaveProperty('password');
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          twoFactorEnabled: true,
        },
      });
    });

    it('should return success with null when neither ID nor email provided', async () => {
      const response = await getUser({});

      expect(response).toBeNull();
      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe('getUserData', () => {
    it('returns selected fields for an existing user', async () => {
      const projection = {
        id: 'user-456',
        email: 'partial@example.com',
      };

      mockFindUnique.mockResolvedValueOnce(projection);

      const result = await getUserData('user-456', {
        id: true,
        email: true,
      });

      expect(result).toEqual(projection);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-456' },
        select: { id: true, email: true },
      });
    });

    it('returns null when userId is empty', async () => {
      const result = await getUserData('', { id: true });

      expect(result).toBeNull();
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('returns null when the database lookup fails', async () => {
      mockFindUnique.mockRejectedValueOnce(new Error('db failure'));

      const result = await getUserData('user-789', { id: true });

      expect(result).toBeNull();
    });
  });

  describe('verifyUserCredentials', () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'USER' as const,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user data for valid credentials', async () => {
      mockFindUnique.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true);

      const user = await verifyUserCredentials(
        'test@example.com',
        'password123'
      );

      expect(user).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        emailVerified: null,
        image: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        isOAuthAccount: false,
      });
      expect(user).not.toHaveProperty('password');
    });

    it('should return null for non-existent user', async () => {
      mockFindUnique.mockResolvedValue(null);

      const user = await verifyUserCredentials(
        'nonexistent@example.com',
        'password123'
      );

      expect(user).toBeNull();
    });

    it('should return null for user without password', async () => {
      const userWithoutPassword = { ...mockUser, password: null };
      mockFindUnique.mockResolvedValue(userWithoutPassword);

      const user = await verifyUserCredentials(
        'test@example.com',
        'password123'
      );

      expect(user).toBeNull();
    });

    it('should return null for invalid password', async () => {
      mockFindUnique.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(false);

      const user = await verifyUserCredentials(
        'test@example.com',
        'wrongpassword'
      );

      expect(user).toBeNull();
    });

    it('should return null when database fails during user lookup', async () => {
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      const user = await verifyUserCredentials(
        'test@example.com',
        'password123'
      );

      expect(user).toBeNull();
    });

    it('should return null for all user lookup functions when database fails', async () => {
      // Arrange: Force database error for all operations
      const dbError = new Error('Simulated database error for testing');
      mockFindUnique.mockRejectedValue(dbError);

      // Act & Assert: Test all user lookup functions
      const functionsToTest = [
        () => getUserById('test-user-id'),
        () => getUserByEmail('test@example.com'),
        () => getUser({ id: 'test-user-id' }),
        () => getUser({ email: 'test@example.com' }),
        () => getUserData('test-user-id', { id: true }),
      ];

      for (const fn of functionsToTest) {
        const result = await fn();
        expect(result).toBeNull();
      }

      // Test verifyUserCredentials separately
      const credentialsResult = await verifyUserCredentials(
        'test@example.com',
        'password'
      );
      expect(credentialsResult).toBeNull();
    });
  });
});
