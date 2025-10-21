import { ROUTES } from '@/lib/navigation';

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
    { label: 'Login', href: ROUTES.AUTH.LOGIN, protected: false },
    { label: 'Register', href: ROUTES.AUTH.REGISTER, protected: false },
    { label: 'Settings', href: ROUTES.SETTINGS, protected: true },
  ],
} as const;

export const siteFeatures = {
  socialAuth: true,
  requireEmailConfirmation: true,
} as const;

export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
} as const;
