/**
 * Application route definitions.
 */
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
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
