import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getUser,
  getUserByEmail,
  getUserByEmailWithoutPassword,
  getUserById,
  getUserByIdWithoutPassword,
  verifyUserCredentials,
} from '@/features/auth/data/user';
import { CoreErrors } from '@/lib/errors/definitions';
import { Status } from '@/lib/response';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
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
  let mockFindUnique: any;

  beforeAll(async () => {
    const { default: prisma } = await import('@/lib/prisma');
    mockFindUnique = vi.mocked(prisma.user.findUnique);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
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

      const response = await getUserById('user-123');

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
        expect(response.data?.id).toBe('user-123');
      }
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return success with null when user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const response = await getUserById('nonexistent-user');

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toBeNull();
      }
    });

    it('should return error when database fails', async () => {
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      const response = await getUserById('user-123');

      expect(response.status).toBe(Status.Error);
      if (response.status === Status.Error) {
        expect(response.error.code).toBe('DATABASE_ERROR');
        expect(response.error.i18nMessage).toEqual(
          CoreErrors.DATABASE_ERROR('getUserById', 'user-123').i18nMessage
        );
      }
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

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
        expect(response.data?.email).toBe('test@example.com');
      }
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return success with null when user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const response = await getUserByEmail('nonexistent@example.com');

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toBeNull();
      }
    });
  });

  describe('getUserByIdWithoutPassword', () => {
    it('should return user without password field', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockUser);

      const response = await getUserByIdWithoutPassword('user-123');

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
        expect(response.data).not.toHaveProperty('password');
      }
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
        },
      });
    });
  });

  describe('getUserByEmailWithoutPassword', () => {
    it('should return user without password field', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER' as const,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockUser);

      const response = await getUserByEmailWithoutPassword('test@example.com');

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
        expect(response.data).not.toHaveProperty('password');
      }
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

      mockFindUnique.mockResolvedValue(mockUser);

      const response = await getUser({
        id: 'user-123',
        email: 'test@example.com',
        includePassword: true,
      });

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
      }
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

      mockFindUnique.mockResolvedValue(mockUser);

      const response = await getUser({
        email: 'test@example.com',
        includePassword: true,
      });

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
      }
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
      };

      mockFindUnique.mockResolvedValue(mockUser);

      const response = await getUser({
        id: 'user-123',
        includePassword: false,
      });

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toEqual(mockUser);
        expect(response.data).not.toHaveProperty('password');
      }
    });

    it('should return success with null when neither ID nor email provided', async () => {
      const response = await getUser({});

      expect(response.status).toBe(Status.Success);
      if (response.status === Status.Success) {
        expect(response.data).toBeNull();
      }
      expect(mockFindUnique).not.toHaveBeenCalled();
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
      const { default: bcrypt } = await import('bcryptjs');
      (bcrypt.compare as any).mockResolvedValue(true);

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
      const { default: bcrypt } = await import('bcryptjs');
      (bcrypt.compare as any).mockResolvedValue(false);

      const user = await verifyUserCredentials(
        'test@example.com',
        'wrongpassword'
      );

      expect(user).toBeNull();
    });

    it('should return error when database fails during user lookup', async () => {
      const dbError = new Error('Database connection failed');
      mockFindUnique.mockRejectedValue(dbError);

      await expect(
        verifyUserCredentials('test@example.com', 'password123')
      ).rejects.toThrow('Database error occurred');
    });

    it('should return DATABASE_ERROR response for all user lookup functions when database fails', async () => {
      // Arrange: Force database error for all operations
      const dbError = new Error('Simulated database error for testing');
      mockFindUnique.mockRejectedValue(dbError);

      // Act & Assert: Test all user lookup functions
      const functionsToTest = [
        { name: 'getUserById', fn: () => getUserById('test-user-id') },
        {
          name: 'getUserByEmail',
          fn: () => getUserByEmail('test@example.com'),
        },
        {
          name: 'getUserByIdWithoutPassword',
          fn: () => getUserByIdWithoutPassword('test-user-id'),
        },
        {
          name: 'getUserByEmailWithoutPassword',
          fn: () => getUserByEmailWithoutPassword('test@example.com'),
        },
        {
          name: 'getUser (with ID)',
          fn: () => getUser({ id: 'test-user-id' }),
        },
        {
          name: 'getUser (with email)',
          fn: () => getUser({ email: 'test@example.com' }),
        },
      ];

      for (const { name, fn } of functionsToTest) {
        const response = await fn();

        expect(
          response.status,
          `Function ${name} should return error status`
        ).toBe(Status.Error);
        if (response.status === Status.Error) {
          expect(
            response.error.code,
            `Function ${name} should return DATABASE_ERROR code`
          ).toBe('DATABASE_ERROR');
          expect(
            response.error.message,
            `Function ${name} should return i18n message object`
          ).toBeDefined();
          // Check if message is an object with key property
          if (
            typeof response.error.message === 'object' &&
            response.error.message !== null
          ) {
            expect(
              response.error.message,
              `Function ${name} should have correct error key`
            ).toBe('errors.database_error');
          }
          expect(
            response.error.details,
            `Function ${name} should include error details`
          ).toBeDefined();
        }
      }

      // Test verifyUserCredentials separately since it throws errors instead of returning Response
      await expect(
        verifyUserCredentials('test@example.com', 'password')
      ).rejects.toThrow('Database error occurred');
    });
  });
});
