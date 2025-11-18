import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useNavigationItems } from '@/features/navigation/hooks/use-navigation-items';
import { navigationItems } from '@/features/navigation/lib/navigation';

// Mock the useCurrentUser hook
vi.mock('@/features/auth/hooks/use-current-user', () => ({
  useCurrentUser: vi.fn(),
}));

const mockUseCurrentUser = vi.mocked(useCurrentUser);

describe('useNavigationItems', () => {
  it('should return all public and guest items for guest users', () => {
    mockUseCurrentUser.mockReturnValue(null); // Guest user

    const { result } = renderHook(() => useNavigationItems());

    const expectedItems = navigationItems.filter(
      item => item.access === 'public' || item.access === 'guest'
    );

    expect(result.current).toEqual(expectedItems);
  });

  it('should return public and protected items for authenticated users, excluding role-restricted items', () => {
    mockUseCurrentUser.mockReturnValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      role: 'USER',
      twoFactorEnabled: false,
      isOAuthAccount: false,
    });

    const { result } = renderHook(() => useNavigationItems());

    // Should include public/protected items, but exclude admin item since it requires ADMIN role
    const expectedItems = navigationItems.filter(item => {
      if (item.access === 'guest') return false;

      if (item.meta?.roles && item.meta.roles.length > 0) {
        return item.meta.roles.includes('USER');
      }

      return item.access === 'public' || item.access === 'protected';
    });

    expect(result.current).toEqual(expectedItems);
  });

  it('should filter items based on user roles when roles are specified', () => {
    mockUseCurrentUser.mockReturnValue({
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      twoFactorEnabled: false,
      isOAuthAccount: false,
    });

    const { result } = renderHook(() => useNavigationItems());

    // Should include public/protected items, and items with roles that match
    const expectedItems = navigationItems.filter(item => {
      if (item.access === 'guest') return false; // Authenticated user shouldn't see guest items

      if (item.meta?.roles && item.meta.roles.length > 0) {
        return item.meta.roles.includes('ADMIN');
      }

      return item.access === 'public' || item.access === 'protected';
    });

    expect(result.current).toEqual(expectedItems);
  });

  it('should exclude items with roles that do not match user role', () => {
    mockUseCurrentUser.mockReturnValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'USER',
      twoFactorEnabled: false,
      isOAuthAccount: false,
    });

    const { result } = renderHook(() => useNavigationItems());

    // Should exclude items that require ADMIN role
    const expectedItems = navigationItems.filter(item => {
      if (item.access === 'guest') return false;

      if (item.meta?.roles && item.meta.roles.length > 0) {
        return item.meta.roles.includes('USER');
      }

      return item.access === 'public' || item.access === 'protected';
    });

    expect(result.current).toEqual(expectedItems);
  });

  it('should exclude role-restricted items when user has no role', () => {
    mockUseCurrentUser.mockReturnValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Without Role',
      role: 'USER', // Even USER role should be excluded if item requires ADMIN
      twoFactorEnabled: false,
      isOAuthAccount: false,
    });

    const { result } = renderHook(() => useNavigationItems());

    // Should exclude any items with roles specified that don't match USER
    const expectedItems = navigationItems.filter(item => {
      if (item.access === 'guest') return false;

      if (item.meta?.roles && item.meta.roles.length > 0) {
        return item.meta.roles.includes('USER');
      }

      return item.access === 'public' || item.access === 'protected';
    });

    expect(result.current).toEqual(expectedItems);
  });

  it('should memoize the result and only recalculate when user changes', () => {
    mockUseCurrentUser.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useNavigationItems());

    const firstResult = result.current;

    // Rerender without changing user
    rerender();
    expect(result.current).toBe(firstResult); // Same reference due to memoization

    // Change user
    mockUseCurrentUser.mockReturnValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      role: 'USER',
      twoFactorEnabled: false,
      isOAuthAccount: false,
    });

    rerender();
    expect(result.current).not.toBe(firstResult); // Different result due to user change
  });
});
