---
description: 'Guidelines for Error Codes, Messages, and i18n Keys'
applyTo: '**'
---

# Error Codes, Messages, and i18n Keys Guidelines

> **Version:** 2.0  
> **Last Updated:** January 2025  
> **Target:** Next.js 15+, TypeScript 5+, i18n-ready

---

## Overview

This document establishes a **unified, consistent pattern** for defining error codes, user-facing messages, and UI labels across the application. The goal is to:

1. Keep codes **URL-friendly** (kebab-case)
2. Organize messages by **domain** and **purpose** in separate files
3. Use **kebab-case** for all i18n keys and error code values
4. Maintain **TypeScript constants** in camelCase for code readability
5. Ensure **i18n-ready** message keys with clear naming

---

## Core Principles

1. **kebab-case for i18n keys and error code values** - `'invalid-credentials'`, `'auth.errors.email-required'`
2. **camelCase for TypeScript property names** - `AUTH_CODES.invalidCredentials` (property name), value: `'invalid-credentials'`
3. **Domain-separated i18n files** - `/locales/{lang}/{domain}.json` (common.json, errors.json, auth.json)
4. **Feature constants in one file** - `strings.ts` contains all codes and message keys for a feature
5. **Maximum 2-3 nesting levels** - Keep i18n structure flat and readable
6. **Type-safe constants** - Use `as const` and export types for all constant objects
7. **Clear separation** - Don't mix error messages with UI labels
8. **No unnecessary examples** - Code should be self-documenting; avoid @example comments unless absolutely necessary

---

## File Organization

### i18n Directory Structure

All translation files are organized by language and domain:

```
src/
  locales/
    en/
      common.json      # Global reusable strings (success, error, loading, etc.)
      errors.json      # Application-wide error messages
      auth.json        # Authentication domain (errors, success, labels)
      posts.json       # Posts domain (errors, success, labels)
      ...
    hu/
      common.json
      errors.json
      auth.json
      posts.json
      ...
```

### Core Error Constants (`src/lib/errors/codes.ts` and `messages.ts`)

Contains **application-wide** error codes and messages that are not feature-specific.

```typescript
// src/lib/errors/codes.ts

/**
 * Core error codes for application-wide errors
 * TypeScript properties: camelCase (for code readability)
 * String values: kebab-case (for URL-friendly usage)
 */
export const CORE_CODES = {
  internalServerError: 'internal-server-error',
  validationFailed: 'validation-failed',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not-found',
  databaseError: 'database-error',
} as const;

export type CoreCode = (typeof CORE_CODES)[keyof typeof CORE_CODES];
```

```typescript
// src/lib/errors/messages.ts

/**
 * Core error messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 */
export const CORE_ERRORS = {
  internalServerError: 'errors.internal-server-error',
  validationFailed: 'errors.validation-failed',
  unauthorized: 'errors.unauthorized',
  forbidden: 'errors.forbidden',
  notFound: 'errors.not-found',
  databaseError: 'errors.database-error',
} as const;
```

### Feature String Constants (`src/features/{feature}/lib/strings.ts`)

Each feature contains **all its codes and messages** in a single strings file.

```typescript
// src/features/auth/lib/strings.ts

/**
 * Auth feature error codes
 * TypeScript properties: camelCase (for code readability)
 * String values: kebab-case (URL-friendly, used in AppError code field and URL parameters)
 */
export const AUTH_CODES = {
  // Validation errors
  invalidFields: 'invalid-fields',
  emailRequired: 'email-required',
  emailInvalid: 'email-invalid',
  passwordRequired: 'password-required',
  passwordTooShort: 'password-too-short',

  // Authentication errors
  invalidCredentials: 'invalid-credentials',
  verificationRequired: 'verification-required',

  // User errors
  userNotFound: 'user-not-found',
  emailExists: 'email-exists',

  // Token errors
  tokenInvalid: 'token-invalid',
  tokenExpired: 'token-expired',
} as const;

export type AuthCode = (typeof AUTH_CODES)[keyof typeof AUTH_CODES];

/**
 * Auth error messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * User-facing error messages shown in forms, toasts, or error pages
 */
export const AUTH_ERRORS = {
  // Validation errors
  invalidFields: 'auth.errors.invalid-fields',
  emailRequired: 'auth.errors.email-required',
  emailInvalid: 'auth.errors.email-invalid',
  passwordRequired: 'auth.errors.password-required',
  passwordTooShort: 'auth.errors.password-too-short',

  // Authentication errors
  invalidCredentials: 'auth.errors.invalid-credentials',
  verificationRequired: 'auth.errors.verification-required',

  // User errors
  userNotFound: 'auth.errors.user-not-found',
  emailExists: 'auth.errors.email-exists',
} as const;

/**
 * Auth success messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  login: 'auth.success.login',
  signup: 'auth.success.signup',
  emailVerified: 'auth.success.email-verified',
  verificationSent: 'auth.success.verification-sent',
  passwordUpdated: 'auth.success.password-updated',
  passwordResetSent: 'auth.success.password-reset-sent',
} as const;

/**
 * Auth UI labels (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  // Page titles
  signupTitle: 'auth.labels.signup-title',
  loginTitle: 'auth.labels.login-title',
  verificationTitle: 'auth.labels.verification-title',
  forgotPasswordTitle: 'auth.labels.forgot-password-title',
  newPasswordTitle: 'auth.labels.new-password-title',

  // Form fields
  emailLabel: 'auth.labels.email',
  emailPlaceholder: 'auth.labels.email-placeholder',
  passwordLabel: 'auth.labels.password',
  passwordPlaceholder: 'auth.labels.password-placeholder',

  // Buttons
  loginButton: 'auth.labels.login-button',
  signupButton: 'auth.labels.signup-button',

  // Links
  forgotPasswordLink: 'auth.labels.forgot-password',
  backToLogin: 'auth.labels.back-to-login',
} as const;
```

---

## Naming Conventions

### Error Codes (`*_CODES`)

- **TypeScript Property:** `camelCase` (e.g., `invalidCredentials`)
- **String Value:** `kebab-case` (e.g., `'invalid-credentials'`)
- **Purpose:** Programmatic error handling, URL parameters
- **Usage:** `code: AUTH_CODES.invalidCredentials` → URL: `?error=invalid-credentials`

### Error Messages (`*_ERRORS`)

- **TypeScript Property:** `camelCase` (e.g., `invalidCredentials`)
- **String Value:** `kebab-case` with dots (e.g., `'auth.errors.invalid-credentials'`)
- **Purpose:** User-facing error messages
- **Usage:** `message: { key: AUTH_ERRORS.invalidCredentials }` → i18n: `'auth.errors.invalid-credentials'`

### Success Messages (`*_SUCCESS`)

- **TypeScript Property:** `camelCase` (e.g., `emailVerified`)
- **String Value:** `kebab-case` with dots (e.g., `'auth.success.email-verified'`)
- **Purpose:** Confirmation messages for successful operations
- **Usage:** `message: { key: AUTH_SUCCESS.emailVerified }` → i18n: `'auth.success.email-verified'`

### UI Labels (`*_LABELS`)

- **TypeScript Property:** `camelCase` (e.g., `loginTitle`)
- **String Value:** `kebab-case` with dots (e.g., `'auth.labels.login-title'`)
- **Purpose:** Static UI text (titles, labels, buttons, placeholders)
- **Usage:** `<h1>{t(AUTH_LABELS.loginTitle)}</h1>` → i18n: `'auth.labels.login-title'`

---

## i18n File Structure

```json
// src/locales/en/common.json
{
  "common": {
    "success": "Operation completed successfully",
    "loading": "Loading...",
    "error": "An error occurred",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "confirm": "Confirm",
    "back": "Back"
  }
}
```

```json
// src/locales/en/errors.json
{
  "errors": {
    "internal-server-error": "An unexpected error occurred. Please try again later.",
    "validation-failed": "Input validation failed. Please check your entries.",
    "unauthorized": "You are not authorized to perform this action.",
    "forbidden": "Access forbidden.",
    "not-found": "{resource} could not be found.",
    "database-error": "A database error occurred. Please try again later."
  }
}
```

```json
// src/locales/en/auth.json
{
  "auth": {
    "errors": {
      "invalid-fields": "Please check your input and try again.",
      "email-required": "Email is required.",
      "email-invalid": "Please enter a valid email address.",
      "password-required": "Password is required.",
      "password-too-short": "Password must be at least {min} characters long.",
      "invalid-credentials": "Invalid email or password.",
      "verification-required": "You need to verify your email before logging in.",
      "user-not-found": "User with email {email} could not be found.",
      "email-exists": "This email is already registered.",
      "token-invalid": "The requested token was not found or is invalid.",
      "token-expired": "The token has expired. Please request a new one."
    },
    "success": {
      "login": "Welcome back!",
      "signup": "Account created successfully!",
      "email-verified": "Email verified! You can now log in.",
      "verification-sent": "A verification email has been sent to {email}.",
      "password-updated": "Your password has been updated successfully.",
      "password-reset-sent": "Password reset instructions have been sent to {email}."
    },
    "labels": {
      "signup-title": "Create an account",
      "login-title": "Sign in",
      "verification-title": "Email verification",
      "forgot-password-title": "Forgot password",
      "new-password-title": "Set new password",
      "email": "Email",
      "email-placeholder": "Enter your email",
      "password": "Password",
      "password-placeholder": "Enter your password",
      "confirm-password": "Confirm password",
      "name": "Name",
      "login-button": "Sign in",
      "signup-button": "Create account",
      "forgot-password": "Forgot password?",
      "back-to-login": "Back to login"
    }
  }
}
```

---

## Usage Rules

### ✅ DO

1. **Use camelCase** for TypeScript property names in constant objects
2. **Use kebab-case** for all string values (error codes and i18n keys)
3. **Consolidate constants** in a single `strings.ts` per feature
4. **Separate by purpose** - ERRORS, SUCCESS, LABELS
5. **Export types** for all constant objects (`as const`)
6. **Document sections** with clear comments
7. **Use namespaced keys** - `auth.errors.*`, `posts.success.*`
8. **Keep code self-documenting** - avoid unnecessary @example comments
9. **Organize by domain** - Separate i18n files for common, errors, and feature-specific strings
10. **Maximum 2-3 nesting levels** - Keep i18n structure flat and readable

### ❌ DON'T

1. **Don't use camelCase** for i18n key values or error code values (use kebab-case)
2. **Don't mix categories** - error messages in LABELS, UI text in ERRORS
3. **Don't split constants** into multiple files (codes.ts, messages.ts) within a feature
4. **Don't use generic keys** - `error`, `success` (use specific names)
5. **Don't hardcode strings** - always use constants
6. **Don't add @example comments** unless absolutely necessary
7. **Don't deeply nest i18n keys** - keep structure flat (max 2-3 levels)

---

## Migration Checklist

When creating a new feature:

- [ ] Create `src/features/{feature}/lib/strings.ts`
- [ ] Define `{FEATURE}_CODES` with camelCase properties and kebab-case values
- [ ] Define `{FEATURE}_ERRORS` with camelCase properties and kebab-case i18n keys (feature.errors.\*)
- [ ] Define `{FEATURE}_SUCCESS` with camelCase properties and kebab-case i18n keys (feature.success.\*)
- [ ] Define `{FEATURE}_LABELS` with camelCase properties and kebab-case i18n keys (feature.labels.\*)
- [ ] Create `src/locales/en/{feature}.json` with kebab-case keys
- [ ] Create `src/locales/hu/{feature}.json` with kebab-case keys (Hungarian translations)
- [ ] Update error helpers in `src/features/{feature}/lib/errors.ts`
- [ ] Import constants in schemas, services, components
- [ ] Write tests using the new constants

---

## Examples

### Error Helper

```typescript
// src/features/auth/lib/errors.ts
import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { AUTH_CODES, AUTH_ERRORS } from './strings';

export const invalidCredentials = () =>
  new AppError({
    code: AUTH_CODES.invalidCredentials,
    message: { key: AUTH_ERRORS.invalidCredentials },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  });
```

### Service Response

```typescript
// src/features/auth/services/login-user.ts
import { response } from '@/lib/response';

import { AUTH_SUCCESS } from '../lib/strings';

export async function loginUser(input: LoginInput) {
  // ... login logic ...

  return response.success({
    data: { userId: user.id },
    message: { key: AUTH_SUCCESS.login },
  });
}
```

### Component Usage

```typescript
// src/features/auth/components/login-form.tsx
import { AUTH_LABELS } from '../lib/strings';

export function LoginForm() {
  const t = useTranslations();

  return (
    <form>
      <h1>{t(AUTH_LABELS.loginTitle)}</h1>
      <label>{t(AUTH_LABELS.emailLabel)}</label>
      <button>{t(AUTH_LABELS.loginButton)}</button>
    </form>
  );
}
```

---

## Future-Proofing

### Adding New Categories

If a new message category is needed (e.g., `INFO`, `WARNING`):

```typescript
export const AUTH_INFO = {
  sessionExpiring: 'auth.info.sessionExpiring',
  rateLimitWarning: 'auth.info.rateLimitWarning',
} as const;
```

### Adding New Features

Follow the same pattern for new features:

```typescript
// src/features/posts/lib/strings.ts
export const POSTS_CODES = {
  /* ... */
};
export const POSTS_ERRORS = {
  /* ... */
};
export const POSTS_SUCCESS = {
  /* ... */
};
export const POSTS_LABELS = {
  /* ... */
};
```

---

## Summary

- **Codes:** camelCase properties, kebab-case values (`invalidCredentials: 'invalid-credentials'`)
- **i18n keys:** camelCase properties, kebab-case values with dots (`invalidCredentials: 'auth.errors.invalid-credentials'`)
- **i18n files:** Domain-separated in `/locales/{lang}/{domain}.json`
- **Organization:** Single `strings.ts` per feature
- **Categories:** CODES, ERRORS, SUCCESS, LABELS
- **Type-safe:** Export types for all constant objects
- **Maintainable:** Clear separation of concerns
- **Nesting:** Maximum 2-3 levels in i18n files

Follow these guidelines for all features to maintain consistency across the application.
