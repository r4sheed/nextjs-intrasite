import { describe, expect, it } from 'vitest';

import { getAllRoutes } from '@/lib/routes';

import {
  navigationItems,
  protectedNavigationItems,
  publicNavigationItems,
} from '@/features/navigation/lib/navigation';

describe('Navigation helpers', () => {
  it('should expose navigation items in configured order', () => {
    const expectedOrder = getAllRoutes()
      .filter(route => route.meta?.showInNavigation)
      .sort(
        (a, b) =>
          (a.meta?.navigationOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.meta?.navigationOrder ?? Number.MAX_SAFE_INTEGER)
      )
      .map(route => route.url);

    const actualOrder = navigationItems.map(item => item.href);
    expect(actualOrder).toEqual(expectedOrder);
  });

  it('should freeze navigation arrays and items', () => {
    expect(Object.isFrozen(navigationItems)).toBe(true);
    navigationItems.forEach(item => {
      expect(Object.isFrozen(item)).toBe(true);
    });
  });

  it('should split navigation by protection status', () => {
    const navigationRoutes = getAllRoutes().filter(
      route => route.meta?.showInNavigation
    );

    const expectedPublic = navigationRoutes
      .filter(route => route.access !== 'protected')
      .map(route => route.url);
    const expectedProtected = navigationRoutes
      .filter(route => route.access === 'protected')
      .sort(
        (a, b) =>
          (a.meta?.navigationOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.meta?.navigationOrder ?? Number.MAX_SAFE_INTEGER)
      )
      .map(route => route.url);

    expect(publicNavigationItems.map(item => item.href)).toEqual(
      expectedPublic
    );
    expect(protectedNavigationItems.map(item => item.href)).toEqual(
      expectedProtected
    );
  });

  it('navigation items map back to route definitions and preserve label/meta', () => {
    navigationItems.forEach(item => {
      const matched = getAllRoutes().find(r => r.url === item.href);
      expect(matched).toBeDefined();
      if (matched) {
        expect(matched.title).toBe(item.title);
        if (matched.meta && item.meta) {
          // Navigation keeps the route.meta reference when present
          expect(item.meta).toBe(matched.meta);
        }
      }
    });
  });

  it('route meta.roles (if present) is a frozen string array and meta is frozen', () => {
    const withRoles = getAllRoutes().filter(r => r.meta?.roles);

    // If there are no role-protected routes yet, test is vacuously true.
    if (withRoles.length === 0) {
      expect(withRoles.length).toBe(0);
      return;
    }

    withRoles.forEach(r => {
      expect(Array.isArray(r.meta!.roles)).toBe(true);
      expect(r.meta!.roles!.every(s => typeof s === 'string')).toBe(true);
      expect(Object.isFrozen(r.meta!.roles)).toBe(true);
      expect(Object.isFrozen(r.meta!)).toBe(true);
    });
  });
});
