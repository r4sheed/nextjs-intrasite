---
description: 'Guidelines for Error Codes, Messages, and i18n Keys'
applyTo: '**'
---

# Error Codes, Messages, and i18n Keys Guidelines

> **Version:** 1.0  
> **Last Updated:** November 2025  
> **Target:** Next.js 15+, TypeScript 5+, i18n-ready

---

## Overview

This document establishes a **unified, consistent pattern** for defining error codes, user-facing messages, and UI labels across the application. The goal is to:

1. Keep codes **URL-friendly** (kebab-case)
2. Organize messages by **purpose** (errors, success, labels)
3. Maintain **feature-scoped constants** in a single file
4. Ensure **i18n-ready** message keys with clear naming

---

## Core Principles

1. **camelCase for codes and i18n keys** - `invalidCredentials`, `auth.errors.emailRequired`
2. **Feature constants in one file** - `strings.ts` contains all codes and message keys for a feature
3. **Three message categories** - ERRORS (user-facing errors), SUCCESS (confirmations), LABELS (UI text)
4. **Type-safe constants** - Use `as const` and export types for all constant objects
5. **Clear separation** - Don't mix error messages with UI labels
6. **No unnecessary examples** - Code should be self-documenting; avoid @example comments unless absolutely necessary

---

## File Organization

### Core Error Constants (`src/lib/errors/constants.ts`)

Contains **application-wide** error codes and messages that are not feature-specific.

```typescript
// src/lib/errors/constants.ts

/**
 * Core error codes for application-wide errors
 * Format: camelCase for URL-friendly usage
 */
export const CORE_CODES = {
  internalServerError: 'internalServerError',
  validationFailed: 'validationFailed',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'notFound',
  databaseError: 'databaseError',
} as const;

export type CoreCode = (typeof CORE_CODES)[keyof typeof CORE_CODES];

/**
 * Core error messages (i18n keys)
 */
export const CORE_ERRORS = {
  internalServerError: 'errors.internalServerError',
  validationFailed: 'errors.validationFailed',
  unauthorized: 'errors.unauthorized',
  forbidden: 'errors.forbidden',
  notFound: 'errors.notFound',
  databaseError: 'errors.databaseError',
} as const;
```

### Feature String Constants (`src/features/{feature}/lib/strings.ts`)

Each feature contains **all its codes and messages** in a single strings file.

```typescript
// src/features/auth/lib/strings.ts

/**
 * Auth feature error codes
 * Format: camelCase, URL-friendly
 * Used in AppError code field and URL parameters
 */
export const AUTH_CODES = {
  // Validation errors
  invalidFields: 'invalidFields',
  emailRequired: 'emailRequired',
  emailInvalid: 'emailInvalid',
  passwordRequired: 'passwordRequired',
  passwordTooShort: 'passwordTooShort',

  // Authentication errors
  invalidCredentials: 'invalidCredentials',
  verificationRequired: 'verificationRequired',

  // User errors
  userNotFound: 'userNotFound',
  emailExists: 'emailExists',

  // Token errors
  tokenInvalid: 'tokenInvalid',
  tokenExpired: 'tokenExpired',
} as const;

export type AuthCode = (typeof AUTH_CODES)[keyof typeof AUTH_CODES];

/**
 * Auth error messages (i18n keys)
 * User-facing error messages shown in forms, toasts, or error pages
 */
export const AUTH_ERRORS = {
  // Validation errors
  invalidFields: 'auth.errors.invalidFields',
  emailRequired: 'auth.errors.emailRequired',
  emailInvalid: 'auth.errors.emailInvalid',
  passwordRequired: 'auth.errors.passwordRequired',
  passwordTooShort: 'auth.errors.passwordTooShort',

  // Authentication errors
  invalidCredentials: 'auth.errors.invalidCredentials',
  verificationRequired: 'auth.errors.verificationRequired',

  // User errors
  userNotFound: 'auth.errors.userNotFound',
  emailExists: 'auth.errors.emailExists',
} as const;

/**
 * Auth success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  login: 'auth.success.login',
  signup: 'auth.success.signup',
  emailVerified: 'auth.success.emailVerified',
  verificationSent: 'auth.success.verificationSent',
  passwordUpdated: 'auth.success.passwordUpdated',
  passwordResetSent: 'auth.success.passwordResetSent',
} as const;

/**
 * Auth UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  // Page titles
  signupTitle: 'auth.labels.signupTitle',
  loginTitle: 'auth.labels.loginTitle',
  verificationTitle: 'auth.labels.verificationTitle',
  forgotPasswordTitle: 'auth.labels.forgotPasswordTitle',
  newPasswordTitle: 'auth.labels.newPasswordTitle',

  // Form fields
  emailLabel: 'auth.labels.email',
  passwordLabel: 'auth.labels.password',

  // Buttons
  loginButton: 'auth.labels.loginButton',
  signupButton: 'auth.labels.signupButton',

  // Links
  forgotPasswordLink: 'auth.labels.forgotPassword',
} as const;
```

---

## Naming Conventions

### Error Codes (`*_CODES`)

- **Format:** `camelCase`
- **Purpose:** Programmatic error handling, URL parameters
- **Examples:** `invalidCredentials`, `emailExists`, `tokenExpired`
- **Usage:** `code: AUTH_CODES.invalidCredentials` → URL: `?error=invalidCredentials`

### Error Messages (`*_ERRORS`)

- **Format:** `{feature}.errors.{errorName}` (camelCase)
- **Purpose:** User-facing error messages
- **Examples:** `auth.errors.invalidCredentials`, `posts.errors.notFound`
- **Usage:** `message: { key: AUTH_ERRORS.invalidCredentials }`

### Success Messages (`*_SUCCESS`)

- **Format:** `{feature}.success.{actionName}` (camelCase)
- **Purpose:** Confirmation messages for successful operations
- **Examples:** `auth.success.login`, `posts.success.created`
- **Usage:** `message: { key: AUTH_SUCCESS.login }`

### UI Labels (`*_LABELS`)

- **Format:** `{feature}.labels.{elementName}` (camelCase)
- **Purpose:** Static UI text (titles, labels, buttons, placeholders)
- **Examples:** `auth.labels.loginTitle`, `auth.labels.email`
- **Usage:** `<h1>{t(AUTH_LABELS.loginTitle)}</h1>`

---

## i18n File Structure

```json
// src/i18n/messages/en.json
{
  "errors": {
    "internalServerError": "An unexpected error occurred. Please try again later.",
    "validationFailed": "Input validation failed. Please check your entries.",
    "unauthorized": "You are not authorized to perform this action.",
    "forbidden": "Access forbidden.",
    "notFound": "{resource} could not be found.",
    "databaseError": "A database error occurred. Please try again later."
  },
  "auth": {
    "errors": {
      "invalidFields": "Please check your input and try again.",
      "emailRequired": "Email is required.",
      "emailInvalid": "Please enter a valid email address.",
      "passwordRequired": "Password is required.",
      "passwordTooShort": "Password must be at least {min} characters long.",
      "invalidCredentials": "Invalid email or password.",
      "verificationRequired": "You need to verify your email before logging in.",
      "userNotFound": "User with email {email} could not be found.",
      "emailExists": "This email is already registered.",
      "tokenInvalid": "The requested token was not found or is invalid.",
      "tokenExpired": "The token has expired. Please request a new one."
    },
    "success": {
      "login": "Welcome back!",
      "signup": "Account created successfully!",
      "emailVerified": "Email verified! You can now log in.",
      "verificationSent": "A verification email has been sent to {email}.",
      "passwordUpdated": "Your password has been updated successfully.",
      "passwordResetSent": "Password reset instructions have been sent to {email}."
    },
    "labels": {
      "signupTitle": "Create an account",
      "loginTitle": "Sign in",
      "verificationTitle": "Email verification",
      "forgotPasswordTitle": "Forgot password",
      "newPasswordTitle": "Set new password",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm password",
      "name": "Name",
      "loginButton": "Sign in",
      "signupButton": "Create account",
      "forgotPassword": "Forgot password?",
      "backToLogin": "Back to login"
    }
  }
}
```

---

## Usage Rules

### ✅ DO

1. **Use camelCase** for all codes and i18n keys
2. **Consolidate constants** in a single `strings.ts` per feature
3. **Separate by purpose** - ERRORS, SUCCESS, LABELS
4. **Export types** for all constant objects (`as const`)
5. **Document sections** with clear comments
6. **Use namespaced keys** - `auth.errors.*`, `posts.success.*`
7. **Keep code self-documenting** - avoid unnecessary @example comments

### ❌ DON'T

1. **Don't use kebab-case or SCREAMING_SNAKE_CASE** for codes (use camelCase)
2. **Don't mix categories** - error messages in LABELS, UI text in ERRORS
3. **Don't split constants** into multiple files (codes.ts, messages.ts)
4. **Don't use generic keys** - `error`, `success` (use specific names)
5. **Don't hardcode strings** - always use constants
6. **Don't add @example comments** unless absolutely necessary

---

## Migration Checklist

When creating a new feature:

- [ ] Create `src/features/{feature}/lib/strings.ts`
- [ ] Define `{FEATURE}_CODES` (camelCase)
- [ ] Define `{FEATURE}_ERRORS` (feature.errors.\*)
- [ ] Define `{FEATURE}_SUCCESS` (feature.success.\*)
- [ ] Define `{FEATURE}_LABELS` (feature.labels.\*)
- [ ] Add i18n keys to `en.json` and `hu.json`
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

- **Codes:** camelCase, URL-friendly (`invalidCredentials`)
- **i18n keys:** camelCase, namespaced (`auth.errors.invalidCredentials`)
- **Organization:** Single `strings.ts` per feature
- **Categories:** CODES, ERRORS, SUCCESS, LABELS
- **Type-safe:** Export types for all constant objects
- **Maintainable:** Clear separation of concerns

Follow these guidelines for all features to maintain consistency across the application.
