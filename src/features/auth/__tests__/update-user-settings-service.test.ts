import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_CODES } from '@/features/auth/lib/strings';

import type { User as PrismaUser } from '@prisma/client';

const createUser = (overrides: Partial<PrismaUser> = {}): PrismaUser => {
  const timestamp = new Date();

  return {
    id: 'user-id',
    name: 'Existing User',
    email: 'user@example.com',
    emailVerified: null,
    image: null,
    password: 'stored-hash',
    role: UserRole.USER,
    twoFactorEnabled: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
};

const setupMocks = (
  options: {
    user?: PrismaUser | null;
    account?: { id: string; userId: string } | null;
    updateResult?: Partial<PrismaUser>;
    verifyPassword?: (password: string) => boolean | Promise<boolean>;
    hashPassword?: (password: string) => string | Promise<string>;
  } = {}
) => {
  const defaultUser =
    options.user === null ? null : options.user || createUser();

  vi.doMock('@/features/auth/data/user', () => ({
    getUserById: vi.fn().mockResolvedValue(defaultUser),
  }));

  vi.doMock('@/features/auth/data/account', () => ({
    getAccountByUserId: vi.fn().mockResolvedValue(options.account ?? null),
  }));

  vi.doMock('@/features/auth/models', () => ({
    User: class {
      async verifyPassword(password: string) {
        if (options.verifyPassword) {
          return options.verifyPassword(password);
        }
        return true;
      }

      static async hashPassword(password: string) {
        if (options.hashPassword) {
          return options.hashPassword(password);
        }
        return `hashed:${password}`;
      }
    },
  }));

  const defaultUpdateResult =
    options.updateResult ||
    (defaultUser
      ? {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          image: defaultUser.image,
          role: defaultUser.role,
          twoFactorEnabled: defaultUser.twoFactorEnabled,
        }
      : undefined);

  const updateSpy = vi.fn().mockResolvedValue(defaultUpdateResult);

  vi.doMock('@/lib/prisma', () => ({
    db: { user: { update: updateSpy } },
  }));

  return { updateSpy, defaultUser };
};

describe('updateUserSettingsService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('updates the password when the current password is valid', async () => {
    const dbUser = createUser({ id: 'user-password' });
    const verifyPassword = vi.fn().mockResolvedValue(true);
    const hashPassword = vi
      .fn()
      .mockImplementation(async (password: string) => `hashed:${password}`);

    const { updateSpy } = setupMocks({
      user: dbUser,
      verifyPassword,
      hashPassword,
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'current-password',
        newPassword: 'next-password',
        confirmPassword: 'next-password',
      },
    });

    expect(verifyPassword).toHaveBeenCalledWith('current-password');
    expect(hashPassword).toHaveBeenCalledWith('next-password');
    expect(updateSpy).toHaveBeenCalledTimes(1);

    const updateArgs = updateSpy.mock.calls[0]?.[0] as
      | {
          where: { id: string };
          data: Record<string, unknown>;
        }
      | undefined;

    if (!updateArgs) {
      throw new Error('updateUserSettingsService did not call db.user.update');
    }

    expect(updateArgs.where).toEqual({ id: dbUser.id });
    expect(updateArgs.data).toMatchObject({ password: 'hashed:next-password' });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.id).toBe(dbUser.id);
  });

  it('returns an error when the current password check fails', async () => {
    const dbUser = createUser({ id: 'user-invalid-password' });
    const verifyPassword = vi.fn().mockResolvedValue(false);

    setupMocks({
      user: dbUser,
      verifyPassword,
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'wrong-password',
        newPassword: 'next-password',
        confirmPassword: 'next-password',
      },
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') {
      throw new Error('Expected error response');
    }
    expect(result.code).toBe(AUTH_CODES.passwordIncorrect);
  });

  it('returns an error when the new password matches the current password', async () => {
    const dbUser = createUser({ id: 'user-same-password' });
    const verifyPassword = vi.fn();

    setupMocks({
      user: dbUser,
      verifyPassword: (password: string) => {
        verifyPassword(password);
        return true;
      },
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'same-password',
        newPassword: 'same-password',
        confirmPassword: 'same-password',
      },
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') {
      throw new Error('Expected error response');
    }

    expect(result.code).toBe(AUTH_CODES.passwordUnchanged);
    expect(verifyPassword).toHaveBeenCalledWith('same-password');
  });

  it('updates two-factor state when toggled', async () => {
    const dbUser = createUser({ id: 'user-2fa', twoFactorEnabled: false });

    const { updateSpy } = setupMocks({
      user: dbUser,
      updateResult: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        twoFactorEnabled: true,
      },
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: { twoFactorEnabled: true },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updateArgs = updateSpy.mock.calls[0]?.[0] as
      | {
          where: { id: string };
          data: Record<string, unknown>;
        }
      | undefined;

    if (!updateArgs) {
      throw new Error('updateUserSettingsService did not call db.user.update');
    }

    expect(updateArgs.where).toEqual({ id: dbUser.id });
    expect(updateArgs.data).toMatchObject({ twoFactorEnabled: true });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.twoFactorEnabled).toBe(true);
  });

  it('clears protected fields for OAuth accounts', async () => {
    const dbUser = createUser({ id: 'oauth-user' });
    const account = { id: 'account-id', userId: dbUser.id };

    const { updateSpy } = setupMocks({
      user: dbUser,
      account,
      updateResult: {
        id: dbUser.id,
        name: 'New Name',
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        twoFactorEnabled: dbUser.twoFactorEnabled,
      },
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        name: 'New Name',
        email: 'new@example.com',
        currentPassword: 'password',
        newPassword: 'newpass',
      },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updateArgs = updateSpy.mock.calls[0]?.[0] as
      | {
          where: { id: string };
          data: Record<string, unknown>;
        }
      | undefined;

    if (!updateArgs) {
      throw new Error('updateUserSettingsService did not call db.user.update');
    }

    expect(updateArgs.data).toMatchObject({
      name: 'New Name',
    });
    expect(updateArgs.data).not.toHaveProperty('email');
    expect(updateArgs.data).not.toHaveProperty('password');

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.isOAuthAccount).toBe(true);
  });

  it('returns current data when no changes are made', async () => {
    const dbUser = createUser({ id: 'no-changes' });

    setupMocks({ user: dbUser });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {},
    });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.name).toBe(dbUser.name);
  });

  it('returns error when user is not found', async () => {
    setupMocks({ user: null });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: 'nonexistent',
      values: { name: 'New Name' },
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') {
      throw new Error('Expected error response');
    }
    expect(result.code).toBe(AUTH_CODES.invalidCredentials);
  });

  it('handles password with leading/trailing spaces', async () => {
    const dbUser = createUser({ id: 'user-spaces' });
    const verifyPassword = vi.fn().mockResolvedValue(true);
    const hashPassword = vi
      .fn()
      .mockImplementation(async (password: string) => `hashed:${password}`);

    const { updateSpy } = setupMocks({
      user: dbUser,
      verifyPassword,
      hashPassword,
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'current-password',
        newPassword: '  new-password  ',
        confirmPassword: '  new-password  ',
      },
    });

    expect(hashPassword).toHaveBeenCalledWith('new-password');
    expect(updateSpy).toHaveBeenCalledTimes(1);

    expect(result.status).toBe('success');
  });

  it('ignores empty password after trimming', async () => {
    const dbUser = createUser({ id: 'user-empty-password' });

    setupMocks({ user: dbUser });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: {
        currentPassword: 'current',
        newPassword: '   ',
        confirmPassword: '   ',
      },
    });

    expect(result.status).toBe('success');
  });

  it('updates only name when only name is provided', async () => {
    const dbUser = createUser({
      id: 'user-name-only',
      name: 'Old Name',
      email: 'email@example.com',
    });

    const { updateSpy } = setupMocks({
      user: dbUser,
      updateResult: {
        id: dbUser.id,
        name: 'New Name',
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        twoFactorEnabled: dbUser.twoFactorEnabled,
      },
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: { name: 'New Name' },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updateArgs = updateSpy.mock.calls[0]?.[0];

    expect(updateArgs.data).toMatchObject({ name: 'New Name' });
    expect(updateArgs.data).not.toHaveProperty('email');
    expect(updateArgs.data).not.toHaveProperty('twoFactorEnabled');

    expect(result.status).toBe('success');
  });

  it('disables two-factor when toggled to false', async () => {
    const dbUser = createUser({
      id: 'user-2fa-disable',
      twoFactorEnabled: true,
    });

    const { updateSpy } = setupMocks({
      user: dbUser,
      updateResult: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        twoFactorEnabled: false,
      },
    });

    const { updateUserSettingsService } = await import(
      '@/features/auth/services/update-user-settings'
    );

    const result = await updateUserSettingsService({
      userId: dbUser.id,
      values: { twoFactorEnabled: false },
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updateArgs = updateSpy.mock.calls[0]?.[0];

    expect(updateArgs.data).toMatchObject({ twoFactorEnabled: false });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      throw new Error('Expected success response');
    }
    expect(result.data?.twoFactorEnabled).toBe(false);
  });
});
