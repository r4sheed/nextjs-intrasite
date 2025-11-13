# Navigation & Route Pattern

## Overview

The application routes are defined in an object containing **URL + i18n key pairs**, which:

- ✅ Complies with TypeScript 5 / ES2022 guidelines
- ✅ Supports i18n translation for breadcrumbs
- ✅ Type-safe and maintainable
- ✅ Centralized route definitions

## File Structure

```
src/
├── lib/
│   ├── navigation.ts          # Route definitions (URL + label key)
│   └── routes.ts               # Route groups (public, auth, protected)
└── locales/
    ├── en/
    │   └── navigation.json     # English translations
    └── hu/
        └── navigation.json     # Hungarian translations
```

## Route Definitions

**File:** `src/lib/navigation.ts`

```typescript
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
    // ...
  },
  settings: {
    url: '/settings',
    label: 'navigation.settings',
  },
} as const;

export type Routes = typeof routes;
```

## i18n Translations

**File:** `src/locales/en/navigation.json`

```json
{
  "navigation": {
    "home": "Home",
    "settings": "Settings",
    "auth": {
      "login": "Sign in",
      "sign-up": "Sign up"
    }
  }
}
```

**File:** `src/locales/hu/navigation.json`

```json
{
  "navigation": {
    "home": "Kezdőlap",
    "settings": "Beállítások",
    "auth": {
      "login": "Bejelentkezés",
      "sign-up": "Regisztráció"
    }
  }
}
```

## Usage Examples

### 1. Links in Components

```tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { routes } from '@/lib/navigation';

export function MyComponent() {
  const t = useTranslations();

  return <Link href={routes.settings.url}>{t(routes.settings.label)}</Link>;
}
```

### 2. Programmatic Navigation

```tsx
import { useRouter } from 'next/navigation';

import { routes } from '@/lib/navigation';

export function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.push(routes.auth.login.url);
  };

  return <button onClick={handleClick}>Login</button>;
}
```

### 3. Breadcrumb Component

```tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { routes } from '@/lib/navigation';

interface BreadcrumbItem {
  url: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations();

  return (
    <nav>
      <ol>
        {items.map((item, index) => (
          <li key={item.url}>
            {index < items.length - 1 ? (
              <Link href={item.url}>{t(item.label)}</Link>
            ) : (
              <span>{t(item.label)}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Usage:
function SettingsPage() {
  const breadcrumbs = [
    { url: routes.home.url, label: routes.home.label },
    { url: routes.settings.url, label: routes.settings.label },
  ];

  return <Breadcrumbs items={breadcrumbs} />;
}
```

### 4. Route Groups (public, auth, protected)

**File:** `src/lib/routes.ts`

```typescript
import { routes } from '@/lib/navigation';

// Public routes (accessible without authentication)
export const publicRoutes = Object.freeze([
  routes.home.url,
  routes.error.url,
  routes.auth.verifyEmail.url,
]) as readonly string[];

// Auth routes (logged-in users should not access these)
export const authRoutes = Object.freeze([
  routes.auth.login.url,
  routes.auth.signUp.url,
  routes.auth.forgotPassword.url,
  routes.auth.newPassword.url,
]) as readonly string[];

// Default redirect after successful login
export const DEFAULT_LOGIN_REDIRECT = routes.settings.url;
```

### 5. Middleware Usage

```typescript
import { routes } from '@/lib/navigation';
import { authRoutes, publicRoutes } from '@/lib/routes';

export default auth(req => {
  const pathname = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL(routes.auth.login.url, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});
```

## Naming Conventions

### TypeScript Property Names

- ✅ **camelCase** - `routes.settings`, `routes.auth.signUp`
- ❌ **SCREAMING_SNAKE_CASE** - `ROUTES.SETTINGS` (old, deprecated)

### i18n Keys

- ✅ **kebab-case with dots** - `'navigation.auth.sign-up'`
- ❌ **camelCase** - `'navigation.auth.signUp'`

### Object Properties

```typescript
// ✅ CORRECT
const routes = {
  settings: { url: '/settings', label: 'navigation.settings' },
};

// ❌ INCORRECT (old pattern)
const ROUTES = {
  SETTINGS: '/settings',
};
```

## Adding a New Route

1. **Define the route** in `navigation.ts`:

```typescript
export const routes = {
  // ...
  profile: {
    url: '/profile',
    label: 'navigation.profile',
  },
};
```

2. **Add translations** in both languages:

```json
// en/navigation.json
{
  "navigation": {
    "profile": "Profile"
  }
}

// hu/navigation.json
{
  "navigation": {
    "profile": "Profil"
  }
}
```

3. **Optional: Update route groups** in `routes.ts`:

```typescript
export const publicRoutes = Object.freeze([
  // ...
  routes.profile.url,
]) as readonly string[];
```

## Why This Pattern?

### ✅ Advantages

1. **Type-safe** - TypeScript compile-time validation
2. **i18n-ready** - All route labels are translatable
3. **Centralized** - All route definitions in one place
4. **Maintainable** - Easy to extend and modify
5. **Consistent** - Uniform usage across the codebase
6. **Breadcrumb-friendly** - URL + label pairs ready to use

### ❌ Problems with Old Pattern

```typescript
// Old (deprecated):
export const ROUTES = {
  SETTINGS: '/settings', // Only URL, no i18n key
};

// Problems:
// 1. No i18n support
// 2. SCREAMING_SNAKE_CASE doesn't comply with guidelines
// 3. Separate label key file needed for breadcrumbs
```

## Related Files

- **Guidelines:** `.github/instructions/messages-and-codes.instructions.md`
- **TypeScript:** `.github/instructions/typescript-5-es2022.instructions.md`
- **Next.js:** `.github/instructions/nextjs.instructions.md`
