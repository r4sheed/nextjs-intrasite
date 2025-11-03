import { routes } from '@/lib/navigation';

/**
 * Core site configuration containing metadata, branding, and navigation settings.
 * This configuration is used throughout the application for consistent branding and navigation.
 */
export const siteConfig = {
  name: 'shadcn/ui',
  author: 'shadcn',
  url: 'https://ui.shadcn.com',
  ogImage: 'https://ui.shadcn.com/og.jpg',
  description:
    'A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.',
  links: {
    twitter: 'https://twitter.com/shadcn',
    github: 'https://github.com/shadcn-ui/ui',
  },
  navItems: [
    {
      label: routes.auth.login.label,
      href: routes.auth.login.url,
    },
    {
      label: routes.auth.signUp.label,
      href: routes.auth.signUp.url,
    },
    {
      label: routes.settings.label,
      href: routes.settings.url,
    },
  ],
} as const;

export type SiteFeatures = typeof siteFeatures;

/**
 * Feature flags for enabling/disabling application features.
 * These control the behavior of various parts of the application.
 */
export const siteFeatures = {
  socialAuth: true, // Enables authentication via OAuth providers (e.g., Google, GitHub) - See AuthProvider for supported providers.
  emailVerification: true, // Require email verification for signup and login
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Theme color constants for meta tags and PWA manifest.
 * Used for consistent theming across light and dark modes.
 */
export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
} as const;
