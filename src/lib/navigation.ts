/**
 * Application route definitions with i18n label keys.
 *
 * Each route contains:
 * - url: The actual URL path
 * - label: i18n key for the route name (used in breadcrumbs, navigation, etc.)
 *
 * @example
 * // In components:
 * <Link href={routes.settings.url}>{t(routes.settings.label)}</Link>
 *
 * // For breadcrumbs:
 * const breadcrumbs = [
 *   { url: routes.home.url, label: t(routes.home.label) },
 *   { url: routes.settings.url, label: t(routes.settings.label) }
 * ];
 */
export const routes = {
  home: {
    url: '/',
    label: 'navigation.home',
  },
  auth: {
    login: {
      url: '/auth/login',
      label: 'navigation.auth.login',
    },
    signUp: {
      url: '/auth/signup',
      label: 'navigation.auth.sign-up',
    },
    forgotPassword: {
      url: '/auth/forgot-password',
      label: 'navigation.auth.forgot-password',
    },
    newPassword: {
      url: '/auth/new-password',
      label: 'navigation.auth.new-password',
    },
    verifyEmail: {
      url: '/auth/verify-email',
      label: 'navigation.auth.verify-email',
    },
  },
  settings: {
    url: '/settings',
    label: 'navigation.settings',
  },
  error: {
    url: '/error',
    label: 'navigation.error',
  },
} as const;

export type Routes = typeof routes;

/**
 * API endpoint routes used internally for backend logic.
 */
export const apiRoutes = {
  auth: '/api/auth',
} as const;

export type ApiRoutes = typeof apiRoutes;
