import { apiRoutes, routes } from '@/lib/navigation';

/**
 * Publicly accessible routes.
 * These do not require authentication.
 */
export const publicRoutes = Object.freeze([
  routes.home.url,
  routes.error.url,
  routes.auth.verifyEmail.url,
]) as readonly string[];

/**
 * Authentication-related routes.
 * Logged-in users should not access these.
 */
export const authRoutes = Object.freeze([
  routes.auth.login.url,
  routes.auth.signUp.url,
  routes.auth.forgotPassword.url,
  routes.auth.newPassword.url,
]) as readonly string[];

/**
 * Pre-computed sets for efficient route lookups in middleware.
 * Using Set.has() instead of Array.includes() for O(1) lookups.
 */
export const publicRouteSet = new Set(publicRoutes);
export const authRouteSet = new Set(authRoutes);

/**
 * Default route after successful login.
 */
export const DEFAULT_LOGIN_REDIRECT = routes.settings.url;

/**
 * Prefix for authentication routes used by middleware.
 */
export const AUTH_ROUTE_PREFIX = apiRoutes.auth;
