/**
 * Enumerates access levels supported by application routes.
 * - `public`: Accessible for all visitors.
 * - `auth`: Auth related flows (login/signup) that should be hidden once authenticated.
 * - `protected`: Requires an authenticated session (future: plus optional role checks).
 */
export type RouteAccess = 'public' | 'auth' | 'protected';

/**
 * Additional metadata that can be attached to a route definition.
 * Exposes navigation visibility, ordering and optional role requirements.
 */
export interface RouteMeta {
  /**
   * Determines if the route should appear in primary navigation.
   */
  showInNavigation?: boolean;
  /**
   * Controls ordering when rendering navigation items.
   */
  navigationOrder?: number;
  /**
   * Optional list of roles required to access the route (future use).
   */
  roles?: readonly string[];
}

export interface RouteDefinition {
  url: string;
  label: string;
  access: RouteAccess;
  meta?: RouteMeta;
}

type RouteNode = {
  [key: string]: RouteNode | RouteDefinition;
};

/**
 * Master route tree for the application. This is the single source of truth for
 * URL paths, i18n labels, access rules and optional metadata.
 */
export const routes = {
  home: {
    url: '/',
    label: 'home',
    access: 'public',
  },
  auth: {
    login: {
      url: '/auth/login',
      label: 'auth.login',
      access: 'auth',
      meta: {
        showInNavigation: true,
        navigationOrder: 1,
      },
    },
    signUp: {
      url: '/auth/signup',
      label: 'auth.sign-up',
      access: 'auth',
      meta: {
        showInNavigation: true,
        navigationOrder: 2,
      },
    },
    forgotPassword: {
      url: '/auth/forgot-password',
      label: 'auth.forgot-password',
      access: 'auth',
    },
    newPassword: {
      url: '/auth/new-password',
      label: 'auth.new-password',
      access: 'auth',
    },
    verify: {
      url: '/auth/verify',
      label: 'auth.verify',
      access: 'public',
    },
  },
  settings: {
    url: '/settings',
    label: 'settings',
    access: 'protected',
    meta: {
      showInNavigation: true,
      navigationOrder: 3,
    },
  },
  admin: {
    url: '/test/admin',
    label: 'admin',
    access: 'protected',
    meta: {
      showInNavigation: true,
      navigationOrder: 4,
    },
  },
  client: {
    url: '/test/client',
    label: 'client',
    access: 'protected',
    meta: {
      showInNavigation: true,
    },
  },
  server: {
    url: '/test/server',
    label: 'server',
    access: 'protected',
    meta: {
      showInNavigation: true,
    },
  },
  error: {
    url: '/error',
    label: 'error',
    access: 'public',
  },
} as const satisfies RouteNode;

type RoutesTree = typeof routes;

type ImmutableRouteDefinition = Readonly<Omit<RouteDefinition, 'meta'>> &
  Readonly<{ meta?: Readonly<RouteMeta> }>;

/**
 * Type guard used when traversing the nested route tree.
 */
function isRouteDefinition(value: unknown): value is RouteDefinition {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.url === 'string' &&
    typeof candidate.label === 'string' &&
    (candidate.access === 'public' ||
      candidate.access === 'auth' ||
      candidate.access === 'protected')
  );
}

function collectRouteDefinitions(
  node: RouteNode | RouteDefinition,
  accumulator: RouteDefinition[]
): void {
  // Depth-first traversal to flatten nested route objects into plain definitions.
  if (isRouteDefinition(node)) {
    accumulator.push(node);
    return;
  }

  Object.values(node).forEach(child => {
    if (child) {
      collectRouteDefinitions(
        child as RouteNode | RouteDefinition,
        accumulator
      );
    }
  });
}

function freezeRoute(route: RouteDefinition): ImmutableRouteDefinition {
  // Deep freeze ensures downstream consumers cannot mutate shared route metadata.
  return Object.freeze({
    url: route.url,
    label: route.label,
    access: route.access,
    ...(route.meta && {
      meta: Object.freeze({
        ...route.meta,
        ...(route.meta.roles && {
          roles: Object.freeze([...route.meta.roles]),
        }),
      } satisfies RouteMeta),
    }),
  });
}

const routeDefinitions: readonly ImmutableRouteDefinition[] = (() => {
  const collected: RouteDefinition[] = [];
  collectRouteDefinitions(routes as RouteNode | RouteDefinition, collected);
  return Object.freeze(collected.map(freezeRoute));
})();

export type Routes = RoutesTree;

/**
 * Returns all route definitions as an immutable array.
 * Useful for generating derived data (navigation, middleware lookups, etc.).
 *
 * @example
 * import { getAllRoutes } from '@/lib/routes';
 *
 * const protectedOnly = getAllRoutes().filter(
 *   route => route.access === 'protected'
 * );
 */
export function getAllRoutes(): readonly ImmutableRouteDefinition[] {
  return routeDefinitions;
}

/**
 * API endpoint routes used internally for backend logic.
 */
export const apiRoutes = {
  auth: '/api/auth',
} as const;

const publicRouteEntries = routeDefinitions.filter(
  route => route.access === 'public'
);
const authRouteEntries = routeDefinitions.filter(
  route => route.access === 'auth'
);
const protectedRouteEntries = routeDefinitions.filter(
  route => route.access === 'protected'
);

/**
 * Publicly accessible routes.
 * These do not require authentication.
 *
 * @example
 * import { publicRoutes } from '@/lib/routes';
 *
 * publicRoutes.includes('/auth/login'); // false
 * publicRoutes.includes('/'); // true
 */
export const publicRoutes = Object.freeze(
  publicRouteEntries.map(route => route.url)
) as readonly string[];

/**
 * Authentication-related routes.
 * Logged-in users should not access these.
 *
 * @example
 * import { authRoutes } from '@/lib/routes';
 *
 * authRoutes.includes('/auth/login'); // true
 */
export const authRoutes = Object.freeze(
  authRouteEntries.map(route => route.url)
) as readonly string[];

/**
 * Protected routes that require authentication.
 *
 * @example
 * import { protectedRoutes } from '@/lib/routes';
 *
 * protectedRoutes.includes('/settings'); // true
 */
export const protectedRoutes = Object.freeze(
  protectedRouteEntries.map(route => route.url)
) as readonly string[];

/**
 * Pre-computed sets for efficient route lookups in middleware.
 * Using Set.has() instead of Array.includes() for O(1) lookups.
 */
export const publicRouteSet = new Set(publicRoutes);
export const authRouteSet = new Set(authRoutes);
export const protectedRouteSet = new Set(protectedRoutes);
