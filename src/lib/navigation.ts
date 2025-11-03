import { getAllRoutes } from '@/lib/routes';

import type { RouteAccess, RouteMeta } from '@/lib/routes';

export { routes, getAllRoutes } from '@/lib/routes';
export type { RouteAccess, RouteDefinition, RouteMeta } from '@/lib/routes';

/**
 * Normalised navigation item derived from the route definitions.
 * Provides consistent shape for layout components rendering navigation links.
 */
export interface NavigationItem {
  label: string;
  href: string;
  access: RouteAccess;
  protected: boolean;
  meta?: RouteMeta;
}

interface NavigationItemWithOrder extends NavigationItem {
  order: number;
}

/**
 * Builds a sorted list of navigation items from the master route definitions.
 * Only routes flagged with `meta.showInNavigation` are included.
 */
const navigationItemsWithOrder: readonly NavigationItemWithOrder[] = (() => {
  const items = getAllRoutes()
    .filter(route => route.meta?.showInNavigation)
    .map<NavigationItemWithOrder>(route => ({
      label: route.label,
      href: route.url,
      access: route.access,
      protected: route.access === 'protected',
      meta: route.meta,
      order: route.meta?.navigationOrder ?? Number.MAX_SAFE_INTEGER,
    }));

  return Object.freeze(
    items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(item => Object.freeze(item))
  );
})();

/**
 * Frozen list of navigation items ready for rendering in UI components.
 *
 * @example
 * import { navigationItems } from '@/lib/navigation';
 *
 * navigationItems.map(item => (
 *   <Link key={item.href} href={item.href}>
 *     {t(item.label)}
 *   </Link>
 * ));
 */
export const navigationItems = Object.freeze(
  navigationItemsWithOrder.map(item =>
    Object.freeze({
      label: item.label,
      href: item.href,
      access: item.access,
      protected: item.protected,
      ...(item.meta && { meta: item.meta }),
    })
  )
) as readonly NavigationItem[];

/**
 * Navigation items visible for both authenticated and unauthenticated visitors.
 *
 * @example
 * import { publicNavigationItems } from '@/lib/navigation';
 *
 * const guestLinks = publicNavigationItems.map(item => ({
 *   href: item.href,
 *   label: item.label,
 * }));
 */
export const publicNavigationItems = Object.freeze(
  navigationItems.filter(item => item.access !== 'protected')
) as readonly NavigationItem[];

/**
 * Navigation items available exclusively to authenticated users.
 *
 * @example
 * import { protectedNavigationItems } from '@/lib/navigation';
 *
 * protectedNavigationItems.forEach(item => secureMenu.add(item.href));
 */
export const protectedNavigationItems = Object.freeze(
  navigationItems.filter(item => item.access === 'protected')
) as readonly NavigationItem[];
