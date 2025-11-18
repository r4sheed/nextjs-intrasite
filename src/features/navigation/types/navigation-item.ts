import type { RouteAccess, RouteMeta } from '@/lib/routes';

/**
 * Normalised navigation item derived from the route definitions.
 * Provides consistent shape for layout components rendering navigation links.
 */
export interface NavigationItem {
  title: string;
  href: string;
  access: RouteAccess;
  meta?: RouteMeta;
}
