import { UserRole } from '@prisma/client';
import { docs } from 'source.config';
import { z } from 'zod';

import { NAVIGATION_LABELS } from '@/features/navigation/lib/strings';

/**
 * Runtime definition of available access levels.
 * Used to create the Zod enum and for other logic if needed.
 */
const ROUTE_ACCESS_LEVELS = ['public', 'guest', 'protected'] as const;

/**
 * Zod schema for route metadata.
 * Defines optional properties for navigation and role-based access.
 */
const RouteMetaSchema = z.object({
  /**
   * Determines if the route should appear in primary navigation.
   */
  showInNavigation: z.boolean().readonly().optional(),
  /**
   * Controls ordering when rendering navigation items.
   */
  navigationOrder: z.number().readonly().optional(),
  /**
   * Optional list of roles required to access the route.
   */
  roles: z.array(z.string()).readonly().optional(),
});

/**
 * Zod schema for a single route definition.
 * Acts as the single source of truth for validation and type inference.
 */
const RouteDefinitionSchema = z.object({
  url: z.string().startsWith('/'),
  title: z.string(),
  access: z.enum(ROUTE_ACCESS_LEVELS),
  meta: RouteMetaSchema.optional(),
});

/**
 * Inferred types from Zod schemas.
 * This ensures the TypeScript types perfectly match the runtime validation logic.
 */
export type RouteAccess = (typeof ROUTE_ACCESS_LEVELS)[number];
export type RouteMeta = z.infer<typeof RouteMetaSchema>;
export type RouteDefinition = z.infer<typeof RouteDefinitionSchema>;

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
    title: NAVIGATION_LABELS.homeTitle,
    access: 'public',
  },
  error: {
    url: '/error',
    title: NAVIGATION_LABELS.errorTitle,
    access: 'public',
  },
  docs: {
    url: '/docs',
    title: NAVIGATION_LABELS.docsTitle,
    access: 'public',
    meta: {
      showInNavigation: true,
    },
  },
  docsArticle: {
    url: `/docs/[...slug]`,
    title: NAVIGATION_LABELS.docsArticleTitle,
    access: 'public',
  },
  news: {
    url: '/news',
    title: NAVIGATION_LABELS.newsTitle,
    access: 'public',
    meta: {
      showInNavigation: true,
    },
  },
  newsArticle: {
    url: '/news/[...slug]',
    title: NAVIGATION_LABELS.newsArticleTitle,
    access: 'public',
  },
  settings: {
    url: '/settings',
    title: NAVIGATION_LABELS.settingsTitle,
    access: 'protected',
    meta: {
      showInNavigation: true,
    },
  },
  admin: {
    url: '/test/admin',
    title: NAVIGATION_LABELS.adminTitle,
    access: 'protected',
    meta: {
      showInNavigation: true,
      roles: [UserRole.MODERATOR],
    },
  },
  client: {
    url: '/test/client',
    title: NAVIGATION_LABELS.clientTitle,
    access: 'protected',
    meta: {
      showInNavigation: true,
    },
  },
  server: {
    url: '/test/server',
    title: NAVIGATION_LABELS.serverTitle,
    access: 'protected',
    meta: {
      showInNavigation: true,
    },
  },
  auth: {
    login: {
      url: '/auth/login',
      title: NAVIGATION_LABELS.loginTitle,
      access: 'guest',
    },
    signUp: {
      url: '/auth/signup',
      title: NAVIGATION_LABELS.signUpTitle,
      access: 'guest',
    },
    forgotPassword: {
      url: '/auth/forgot-password',
      title: NAVIGATION_LABELS.forgotPasswordTitle,
      access: 'guest',
    },
    newPassword: {
      url: '/auth/new-password',
      title: NAVIGATION_LABELS.newPasswordTitle,
      access: 'guest',
    },
    logout: {
      url: '/auth/logout',
      title: NAVIGATION_LABELS.logoutTitle,
      access: 'protected',
    },
    verify: {
      url: '/auth/verify',
      title: NAVIGATION_LABELS.verifyEmailTitle,
      access: 'public',
    },
  },
} as const satisfies RouteNode;

type RoutesTree = typeof routes;

type ImmutableRouteDefinition = Readonly<Omit<RouteDefinition, 'meta'>> &
  Readonly<{ meta?: Readonly<RouteMeta> }>;

/**
 * Type guard using Zod for robust runtime validation.
 * Checks if a value matches the RouteDefinitionSchema structure.
 */
const isRouteDefinition = (value: unknown): value is RouteDefinition => {
  return RouteDefinitionSchema.safeParse(value).success;
};

const collectRouteDefinitions = (
  node: RouteNode | RouteDefinition,
  accumulator: RouteDefinition[]
): void => {
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
};

const freezeRoute = (route: RouteDefinition): ImmutableRouteDefinition => {
  // Deep freeze ensures downstream consumers cannot mutate shared route metadata.
  return Object.freeze({
    url: route.url,
    title: route.title,
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
};

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
 * route => route.access === 'protected'
 * );
 */
export const getAllRoutes = (): readonly ImmutableRouteDefinition[] => {
  return routeDefinitions;
};

/**
 * API endpoint routes used internally for backend logic.
 */
export const apiRoutes = {
  auth: '/api/auth',
} as const;

const publicRouteEntries = routeDefinitions.filter(
  route => route.access === 'public'
);
const guestRouteEntries = routeDefinitions.filter(
  route => route.access === 'guest'
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
 * import { guestRoutes } from '@/lib/routes';
 *
 * guestRoutes.includes('/auth/login'); // true
 */
export const guestRoutes = Object.freeze(
  guestRouteEntries.map(route => route.url)
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
export const guestRouteSet = new Set(guestRoutes);
export const protectedRouteSet = new Set(protectedRoutes);
