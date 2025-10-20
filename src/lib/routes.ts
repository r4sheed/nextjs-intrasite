import { API_ROUTES, ROUTES } from '@/lib/navigation';

/**
 * Publicly accessible routes.
 * These do not require authentication.
 */
export const PUBLIC_ROUTES = Object.freeze([
  ROUTES.HOME,
  ROUTES.ERROR,
]) as readonly string[];

/**
 * Authentication-related routes.
 * Logged-in users should not access these.
 */
export const AUTH_ROUTES = Object.freeze([
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
]) as readonly string[];

/**
 * Default route after successful login.
 */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.SETTINGS;

/**
 * Prefix for authentication routes used by middleware.
 */
export const AUTH_ROUTE_PREFIX = API_ROUTES.AUTH;
