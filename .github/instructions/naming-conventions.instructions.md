---
description: 'Unified Naming Conventions for the Project'
applyTo: '**'
---

# Unified Naming Conventions

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** All project files

---

## Overview

This document establishes a **single source of truth** for all naming conventions across the project. Following these rules ensures consistency, readability, and maintainability.

---

## 1. General Naming

| Category               | Convention   | Example                             | Notes                                 |
| ---------------------- | ------------ | ----------------------------------- | ------------------------------------- |
| **Folders**            | `kebab-case` | `user-profile`, `lib`, `components` | Lowercase, words separated by hyphens |
| **Files (Components)** | `kebab-case` | `user-card.tsx`, `login-form.tsx`   | Lowercase, words separated by hyphens |
| **Files (Hooks)**      | `kebab-case` | `use-user.ts`, `use-layout.ts`      | Lowercase, words separated by hyphens |
| **Files (Utilities)**  | `kebab-case` | `date-formatter.ts`, `utils.ts`     | Lowercase, words separated by hyphens |
| **Files (Static)**     | `kebab-case` | `logo-dark.svg`, `background.png`   | Lowercase, words separated by hyphens |
| **Variables**          | `camelCase`  | `userName`, `isAuthenticating`      | Start with lowercase letter           |
| **Functions**          | `camelCase`  | `getUserById`, `calculateTotal`     | Start with lowercase letter           |
| **Types/Interfaces**   | `PascalCase` | `User`, `LoginInput`, `ApiResponse` | Start with uppercase letter           |
| **Enums**              | `PascalCase` | `Status`, `UserRole`                | Start with uppercase letter           |

---

## 2. Constants

The style for constants depends on whether they are primitive values or complex objects/arrays.

### ✅ Primitive Constants: `UPPER_SNAKE_CASE`

Use for standalone, primitive values (string, number, boolean) that are universally constant.

```typescript
const MAX_RETRY_COUNT = 3;
const API_TIMEOUT_MS = 5000;
const DEFAULT_LOGIN_REDIRECT = '/dashboard';
```

### ✅ Object/Array Constants: `camelCase`

Use for constant objects, arrays, or configurations. The variable itself is `camelCase`, and its properties are also `camelCase`. Use `as const` for type safety.

```typescript
// CORRECT: `camelCase` for the variable name
const siteConfig = {
  name: 'MyApp',
  version: '1.0.0',
} as const;

const publicRoutes = ['/home', '/about'] as const;

// INCORRECT: Don't use SCREAMING_SNAKE_CASE for objects/arrays
const PUBLIC_ROUTES = ['/home', '/about']; // ❌
const SITE_CONFIG = { name: 'MyApp' }; // ❌
```

---

## 3. Error Codes & i18n Keys

This section defines the canonical pattern for error codes, messages, and i18n keys.

> **For detailed implementation patterns, see:** [messages-and-codes.instructions.md](messages-and-codes.instructions.md)

### Summary Table

| Category                   | TypeScript Property | String Value (Code/Key)      | Example                               |
| -------------------------- | ------------------- | ---------------------------- | ------------------------------------- |
| **Error Codes**            | `camelCase`         | `kebab-case`                 | `code: AUTH_CODES.invalidCredentials` |
| **Error/Success Messages** | `camelCase`         | `domain.category.kebab-case` | `key: AUTH_ERRORS.invalidCredentials` |
| **UI Labels**              | `camelCase`         | `domain.labels.kebab-case`   | `t(AUTH_LABELS.loginTitle)`           |

### ✅ `camelCase` for TypeScript Properties

Object properties in TypeScript should always be `camelCase` for consistency and better developer experience (e.g., IntelliSense).

```typescript
// CORRECT - camelCase object properties
export const AUTH_CODES = {
  invalidCredentials: 'invalid-credentials', // ✅
  emailRequired: 'email-required', // ✅
} as const;

// INCORRECT - SCREAMING_SNAKE_CASE properties
export const BAD_AUTH_CODES = {
  INVALID_CREDENTIALS: 'invalid-credentials', // ❌ Requires bracket access
  EMAIL_REQUIRED: 'email-required', // ❌ Inconsistent with other JS objects
} as const;
```

---

## 4. Feature-Specific Naming (Auth Example)

For feature-specific file and function naming, follow a consistent pattern. This section now serves as an example of applying the general rules.

### File Naming (`{action}-{resource}.ts`)

- **Actions:** `login-user.ts`, `register-user.ts`
- **Services:** `verify-email.ts`, `reset-password.ts`
- **Data:** `user.ts`, `verification-token.ts`

### Function Naming

- **Actions/Services:** `{action}{Resource}` (e.g., `loginUser`, `registerUser`)
- **Data Layer:** `{verb}{Resource}{ByCriteria}` (e.g., `getUserByEmail`, `getVerificationTokenByToken`)
- **Types:** `{Action}{Resource}Data` (e.g., `LoginUserData`)

---

## 5. Component Naming

- **Component Files:** `kebab-case` (e.g., `user-card.tsx`)
- **Component Exports:** `PascalCase` (e.g., `UserCard`)
- **Context Providers:** `XyzProvider` (e.g., `ThemeProvider`)

---

## Summary: DOs and DON'Ts

### ✅ DO

- **Use `kebab-case`** for all file and folder names.
- **Use `camelCase`** for variables, functions, and object properties.
- **Use `PascalCase`** for types, interfaces, enums, and component exports.
- **Use `UPPER_SNAKE_CASE`** for primitive constants ONLY.
- **Use `as const`** for type-safe constant objects.
- **Follow the `domain.category.kebab-case`** pattern for i18n keys.

### ❌ DON'T

- **Don't use `SCREAMING_SNAKE_CASE`** for object or array constants.
- **Don't use `PascalCase`** for files or folders.
- **Don't prefix interfaces** with `I` (e.g., `IUser`).
- **Don't mix naming styles** within the same category.
