---
description: 'Guidelines for Error Codes, Messages, and i18n Keys'
applyTo: '**'
---

# Error Codes, Messages, and i18n Keys Guidelines

> **Version:** 2.1  
> **Last Updated:** November 2025  
> **Target:** Next.js 15+, TypeScript 5+, i18n-ready

**Changelog:**

- **Version 2.1 (2025-11-14):** Added naming patterns for UI labels with descriptive suffixes and flat structure guidelines.
- **Version 2.0 (2025-10-15):** Initial structured version.

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

1. **kebab-case for i18n keys and error code values** - `'invalid-credentials'`, `'errors.email-required'`
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

> **Note:** For detailed core error definitions and usage patterns, see [error-handling-guidelines.instructions.md](error-handling-guidelines.instructions.md).

**Example structure:**

- `CORE_CODES` - camelCase properties with kebab-case values (e.g., `internalServerError: 'internal-server-error'`)
- `CORE_ERRORS` - camelCase properties with kebab-case i18n keys (e.g., `internalServerError: 'errors.internal-server-error'`)

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
  invalidFields: 'errors.invalid-fields',
  emailRequired: 'errors.email-required',
  emailInvalid: 'errors.email-invalid',
  passwordRequired: 'errors.password-required',
  passwordTooShort: 'errors.password-too-short',

  // Authentication errors
  invalidCredentials: 'errors.invalid-credentials',
  verificationRequired: 'errors.verification-required',

  // User errors
  userNotFound: 'errors.user-not-found',
  emailExists: 'errors.email-exists',
} as const;

/**
 * Auth success messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * Confirmation messages for successful operations
 */
export const AUTH_SUCCESS = {
  login: 'success.login',
  signup: 'success.signup',
  emailVerified: 'success.email-verified',
  verificationSent: 'success.verification-sent',
  passwordUpdated: 'success.password-updated',
  passwordResetSent: 'success.password-reset-sent',
} as const;

/**
 * Auth info messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * General informational messages, status updates, and transient UI feedback
 */
export const AUTH_INFO = {
  savingPreferences: 'info.saving-preferences',
  noChangesToSave: 'info.no-changes-to-save',
  updatingSecuritySettings: 'info.updating-security-settings',
} as const;

/**
 * Auth UI labels (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const AUTH_LABELS = {
  // Page titles
  signupTitle: 'labels.signup-title',
  loginTitle: 'labels.login-title',
  verificationTitle: 'labels.verification-title',
  forgotPasswordTitle: 'labels.forgot-password-title',
  newPasswordTitle: 'labels.new-password-title',

  // Form fields
  emailLabel: 'labels.email',
  emailPlaceholder: 'labels.email-placeholder',
  passwordLabel: 'labels.password',
  passwordPlaceholder: 'labels.password-placeholder',

  // Buttons
  loginButton: 'labels.login-button',
  signupButton: 'labels.signup-button',

  // Links
  forgotPasswordLink: 'labels.forgot-password',
  backToLogin: 'labels.back-to-login',
} as const;
```

#### Naming Patterns for UI Labels

To maintain consistency and readability, follow these patterns when naming UI label keys:

- **Use descriptive suffixes** to indicate the type of UI element:
  - `-button` for buttons (e.g., `login-button`, `signup-button`)
  - `-link` for links (e.g., `forgot-password-link`, `back-to-login-link`)
  - `-title` for page or section titles (e.g., `signup-title`, `verification-title`)
  - `-description` for explanatory text or help text (e.g., `change-password-description`, `email-description`)
  - `-placeholder` for input placeholders (e.g., `email-placeholder`, `password-placeholder`)
  - `-label` for form field labels (e.g., `email-label`, `password-label`)
  - `-subtitle` for secondary titles or subtitles (e.g., `signup-subtitle`, `verification-subtitle`)

- **Keep the structure flat** under `labels` - do not create sub-objects like `buttons`, `links`, or `fields` to avoid over-complication and maintain searchability.

- **Consistency check**: When adding new labels, ensure they follow the existing patterns in the file. For example, if adding a new button, use `-button`; if adding a new link, use `-link`.

---

## Naming Conventions

> **Important:** This section defines the canonical naming pattern for ALL error codes, messages, and i18n keys in the application. For general naming conventions, see [naming-conventions.instructions.md](naming-conventions.instructions.md).

### Why `camelCase` Properties (Not `SCREAMING_SNAKE_CASE`)?

**TypeScript/JavaScript Best Practice:**

```typescript
// ✅ CORRECT - camelCase object properties
export const CORE_ERRORS = {
  notFound: 'errors.not-found', // camelCase property
  internalServerError: 'errors.internal-server-error',
} as const;

// ❌ WRONG - SCREAMING_SNAKE_CASE properties
export const CORE_ERRORS = {
  NOT_FOUND: 'errors.not-found', // ❌ Requires bracket access
  INTERNAL_SERVER_ERROR: 'errors.internal-server-error',
} as const;
```

**Rationale:**

1. **TypeScript Convention** - Object properties use `camelCase`, only primitive constants use `SCREAMING_SNAKE_CASE`
2. **IntelliSense** - `CORE_ERRORS.not...` auto-completes better than `CORE_ERRORS.NOT...`
3. **Consistency** - Matches React props, state, and all other JavaScript object properties
4. **Readability** - Multi-word identifiers are easier to read: `internalServerError` vs `INTERNAL_SERVER_ERROR`

**When to use `SCREAMING_SNAKE_CASE`:**

```typescript
// ✅ ONLY for primitive constants
const MAX_RETRY_COUNT = 3;
const API_TIMEOUT_MS = 5000;

// ❌ NOT for object properties
const CONFIG = {
  MAX_RETRY_COUNT: 3, // ❌ Should be maxRetryCount
};
```

### Error Codes (`*_CODES`)

- **TypeScript Property:** `camelCase` (e.g., `invalidCredentials`)
- **String Value:** `kebab-case` (e.g., `'invalid-credentials'`)
- **Purpose:** Programmatic error handling, URL parameters
- **Usage:** `code: AUTH_CODES.invalidCredentials` → URL: `?error=invalid-credentials`

### Error Messages (`*_ERRORS`)

- **TypeScript Property:** `camelCase` (e.g., `invalidCredentials`)
- **String Value:** `kebab-case` with dots (e.g., `'errors.invalid-credentials'`)
- **Purpose:** User-facing error messages
- **Usage:** `message: { key: AUTH_ERRORS.invalidCredentials }` → i18n: `'errors.invalid-credentials'`

### Success Messages (`*_SUCCESS`)

- **TypeScript Property:** `camelCase` (e.g., `emailVerified`)
- **String Value:** `kebab-case` with dots (e.g., `'success.email-verified'`)
- **Purpose:** Confirmation messages for successful operations
- **Usage:** `message: { key: AUTH_SUCCESS.emailVerified }` → i18n: `'success.email-verified'`

### UI Labels (`*_LABELS`)

- **TypeScript Property:** `camelCase` (e.g., `loginTitle`)
- **String Value:** `kebab-case` with dots (e.g., `'labels.login-title'`)
- **Purpose:** Static UI text (titles, labels, buttons, placeholders)
- **Usage:** `<h1>{t(AUTH_LABELS.loginTitle)}</h1>` → i18n: `'labels.login-title'`

### Info Messages (`*_INFO`)

- **TypeScript Property:** `camelCase` (e.g., `savingPreferences`)
- **String Value:** `kebab-case` with dots (e.g., `'info.saving-preferences'`)
- **Purpose:** General informational messages, status updates, and transient UI feedback (e.g., "Saving...", "No changes to save")
- **Usage:** `{t(AUTH_INFO.savingPreferences)}` → i18n: `'info.saving-preferences'`

---

## Organization by Usage/Functionality (Not by Component)

**IMPORTANT:** When adding new UI labels and messages, organize them by **usage** or **functionality** rather than by specific components. This ensures reusability and logical grouping.

### ✅ CORRECT: Group by Usage

```typescript
export const AUTH_LABELS = {
  // Page titles (used across different pages)
  signupTitle: 'labels.signup-title',
  loginTitle: 'labels.login-title',
  changePasswordTitle: 'labels.change-password-title',
  twoFactorTitle: 'labels.two-factor-title',

  // Page descriptions (used for explanatory text)
  signupSubtitle: 'labels.signup-subtitle',
  changePasswordDescription: 'labels.change-password-description',
  twoFactorDescription: 'labels.two-factor-description',

  // Form field labels (used in various forms)
  emailLabel: 'labels.email',
  passwordLabel: 'labels.password',
  currentPasswordLabel: 'labels.current-password',

  // Field descriptions (used for help text)
  currentPasswordDescription: 'labels.current-password-description',
  twoFactorToggleDescription: 'labels.two-factor-toggle-description',

  // Buttons (used across different forms/actions)
  loginButton: 'labels.login-button',
  signupButton: 'labels.signup-button',
  updatePasswordButton: 'labels.update-password-button',
  saveChangesButton: 'labels.save-changes-button',
} as const;
```

### ❌ WRONG: Group by Component

```typescript
// DON'T DO THIS - component-specific grouping reduces reusability
export const AUTH_LABELS = {
  // Security section specific (what if we need these elsewhere?)
  securitySection: {
    changePasswordTitle: 'labels.change-password-title',
    updatePasswordButton: 'labels.update-password-button',
  },
  twoFactorSection: {
    twoFactorTitle: 'labels.two-factor-title',
    saveChangesButton: 'labels.save-changes-button',
  },
} as const;
```

**Why wrong:**

- **Reduced reusability** - Labels can't be used in other components
- **Maintenance burden** - Changes require updating multiple places
- **Poor discoverability** - Hard to find related labels
- **Inconsistent structure** - Different components have different patterns

**Benefits of usage-based organization:**

- **Reusability** - Same labels can be used across multiple components
- **Consistency** - Similar UI elements use the same labels
- **Maintainability** - Changes affect all usages automatically
- **Discoverability** - Related labels are grouped together
- **Future-proof** - Easy to add new components without duplicating labels

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
7. **Use domain-relative keys** - `errors.*`, `success.*`, `labels.*` (relative to the domain namespace)
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
8. **Don't use `SCREAMING_SNAKE_CASE` for object/array constants** - use `camelCase` for variable names (e.g., `publicRoutes` not `PUBLIC_ROUTES`)

---

## Text Management Policy

### ⚠️ Mandatory Script Usage

**All text additions, updates, and organization must be done through the i18n management script.**

- ❌ **Do not manually edit** locale JSON files or constants files
- ❌ **Do not add hardcoded strings** to components or services
- ✅ **Always use the script** for any text changes
- ✅ **Use constants** from `strings.ts` files in your code

This ensures:

- Consistency across all languages
- Automatic TypeScript constant updates
- Proper key sorting and formatting
- Prevention of duplicate or missing translations

### Script Usage

Use the unified i18n management script for all text operations:

```bash
# Add new translation key
npm run i18n:manage add <key> <en-text> <hu-text>

# Update existing translation key
npm run i18n:manage update <key> <en-text> <hu-text>

# Delete translation key
npm run i18n:manage delete <key>
```

**Examples:**

```bash
# Add new error message
npm run i18n:manage add auth.errors.new-error "New error occurred" "Új hiba történt"

# Update existing success message
npm run i18n:manage update auth.success.login "Welcome back!" "Üdvözöljük újra!"

# Delete old error message
npm run i18n:manage delete auth.errors.old-error

# Add core error (flat structure)
npm run i18n:manage add errors.database-error "Database error occurred" "Adatbázis hiba történt"
```

### Key Format Requirements

**Nested Structure (Most Domains):**

```
domain.category.key
├── domain: auth, posts, common, etc.
├── category: errors, success, labels, info
└── key: kebab-case-identifier
```

**Examples:**

- `auth.errors.invalid-credentials`
- `auth.success.login`
- `auth.labels.email-placeholder`

**Flat Structure (Errors Domain):**

```
errors.key
├── domain: errors (fixed)
└── key: kebab-case-identifier
```

**Examples:**

- `errors.not-found`
- `errors.internal-server-error`

---

## Migration Checklist

When creating a new feature:

- [ ] Create `src/features/{feature}/lib/strings.ts`
- [ ] Define `{FEATURE}_CODES` with camelCase properties and kebab-case values
- [ ] Define `{FEATURE}_ERRORS` with camelCase properties and kebab-case i18n keys (errors.\*)
- [ ] Define `{FEATURE}_SUCCESS` with camelCase properties and kebab-case i18n keys (success.\*)
- [ ] Define `{FEATURE}_INFO` with camelCase properties and kebab-case i18n keys (info.\*)
- [ ] Define `{FEATURE}_LABELS` with camelCase properties and kebab-case i18n keys (labels.\*)
- [ ] Use `npm run i18n:manage add` to add all translation keys (script creates locale files automatically)
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
  sessionExpiring: 'info.sessionExpiring',
  rateLimitWarning: 'info.rateLimitWarning',
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
- **i18n keys:** camelCase properties, kebab-case values with dots (`invalidCredentials: 'errors.invalid-credentials'`)
- **i18n files:** Domain-separated in `/locales/{lang}/{domain}.json`
- **Organization:** Single `strings.ts` per feature
- **Categories:** CODES, ERRORS, SUCCESS, INFO, LABELS
- **Type-safe:** Export types for all constant objects
- **Maintainable:** Clear separation of concerns
- **Nesting:** Maximum 2-3 levels in i18n files

Follow these guidelines for all features to maintain consistency across the application.
