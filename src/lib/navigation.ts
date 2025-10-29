/**
 * Application route definitions.
 */
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESET_PASSWORD: '/auth/reset',
    NEW_PASSWORD: '/auth/new-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  SETTINGS: '/settings',
  ERROR: '/error',
} as const;

export type Routes = typeof ROUTES;

/**
 * API endpoint routes used internally for backend logic.
 */
export const API_ROUTES = {
  AUTH: '/api/auth',
} as const;

export type ApiRoutes = typeof API_ROUTES;
