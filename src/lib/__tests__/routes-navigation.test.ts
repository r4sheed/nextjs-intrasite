import { describe, expect, it } from 'vitest';

import { middlewareConfig } from '@/lib/config';
import {
  navigationItems,
  protectedNavigationItems,
  publicNavigationItems,
} from '@/lib/navigation';
import {
  authRouteSet,
  authRoutes,
  getAllRoutes,
  protectedRouteSet,
  protectedRoutes,
  publicRouteSet,
  publicRoutes,
  routes,
} from '@/lib/routes';

describe('Route definitions', () => {
  const collectRouteUrls = (node: unknown): string[] => {
    if (
      node &&
      typeof node === 'object' &&
      'url' in (node as Record<string, unknown>) &&
      'label' in (node as Record<string, unknown>)
    ) {
      return [(node as { url: string }).url];
    }

    if (node && typeof node === 'object') {
      return Object.values(node).flatMap(value => collectRouteUrls(value));
    }

    return [];
  };

  it('should flatten nested route tree via getAllRoutes', () => {
    const manualUrls = collectRouteUrls(routes).sort();
    const exposedUrls = getAllRoutes()
      .map(route => route.url)
      .sort();

    expect(exposedUrls).toEqual(manualUrls);
  });

  it('should derive route access lists from definitions', () => {
    const definitions = getAllRoutes();

    const collectByAccess = (access: string) =>
      definitions
        .filter(route => route.access === access)
        .map(route => route.url)
        .sort();

    expect(publicRoutes.slice().sort()).toEqual(collectByAccess('public'));
    expect(authRoutes.slice().sort()).toEqual(collectByAccess('auth'));
    expect(protectedRoutes.slice().sort()).toEqual(
      collectByAccess('protected')
    );
  });

  it('should expose matching sets for quick lookups', () => {
    expect(publicRouteSet.size).toBe(publicRoutes.length);
    expect(authRouteSet.size).toBe(authRoutes.length);
    expect(protectedRouteSet.size).toBe(protectedRoutes.length);

    publicRoutes.forEach(url => expect(publicRouteSet.has(url)).toBe(true));
    authRoutes.forEach(url => expect(authRouteSet.has(url)).toBe(true));
    protectedRoutes.forEach(url =>
      expect(protectedRouteSet.has(url)).toBe(true)
    );
  });

  it('middlewareConfig.defaultLoginRedirect points to first protected route or home', () => {
    const expected = protectedRoutes[0] ?? routes.home.url;
    expect(middlewareConfig.defaultLoginRedirect).toBe(expected);
  });
});

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
        expect(matched.label).toBe(item.label);
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
