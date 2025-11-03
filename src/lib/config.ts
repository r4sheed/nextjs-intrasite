import { routes } from '@/lib/navigation';

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
    { label: 'Login', href: routes.auth.login.url, protected: false },
    { label: 'Register', href: routes.auth.signUp.url, protected: false },
    { label: 'Settings', href: routes.settings.url, protected: true },
  ],
} as const;

export const siteFeatures = {
  socialAuth: true, // Enables authentication via OAuth providers (e.g., Google, GitHub) - See AuthProvider for supported providers.
  emailVerification: true, // Require email verification for login or registration
} as const;

export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
} as const;
