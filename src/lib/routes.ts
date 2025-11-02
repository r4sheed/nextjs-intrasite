import { API_ROUTES, ROUTES } from '@/lib/navigation';

/**
 * Publicly accessible routes.
 * These do not require authentication.
 */
export const publicRoutes = Object.freeze([
  ROUTES.HOME,
  ROUTES.ERROR,
  ROUTES.AUTH.VERIFY_EMAIL,
]) as readonly string[];

/**
 * Authentication-related routes.
 * Logged-in users should not access these.
 */
export const authRoutes = Object.freeze([
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGN_UP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.NEW_PASSWORD,
]) as readonly string[];

/**
 * Default route after successful login.
 */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.SETTINGS;

/**
 * Prefix for authentication routes used by middleware.
 */
export const AUTH_ROUTE_PREFIX = API_ROUTES.AUTH;
