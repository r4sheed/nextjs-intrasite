---
applyTo: '**'
---

# Auth Feature Naming Conventions

## Overview

Uniform naming pattern within the auth feature for better readability and maintainability.

---

## 📁 File Naming Pattern

### Actions Layer (`src/features/auth/actions/`)

- **Pattern**: `{action}-{resource}.ts`
- **Examples**:
  - `login-user.ts` - User login action
  - `register-user.ts` - User registration action
  - `verify-email.ts` - Email verification action
  - `reset-password.ts` - Password reset request action
  - `update-password.ts` - Password update with token action

### Services Layer (`src/features/auth/services/`)

- **Pattern**: `{action}-{resource}.ts`
- **Examples**:
  - `login-user.ts` - User login service
  - `register-user.ts` - User registration service
  - `verify-email.ts` - Email verification service
  - `reset-password.ts` - Password reset request service
  - `update-password.ts` - Password update with token service

### Data Layer (`src/features/auth/data/`)

- **Pattern**: `{resource}.ts`
- **Examples**:
  - `user.ts` - User repository functions
  - `verification-token.ts` - Verification token repository
  - `reset-token.ts` - Password reset token repository

---

## 🔤 Export Naming Pattern

### Actions Layer

- **Function**: `{action}{Resource}` (camelCase)
- **Type**: `{Action}{Resource}Data` (PascalCase)

**Examples**:

```typescript
// File: login-user.ts
export type LoginUserData = { userId: string };
export const loginUser = async (
  values: LoginInput
): Promise<Response<LoginUserData>> => {
  // ...
};
```

```typescript
// File: verify-email.ts
export type VerifyEmailData = Record<string, never>;
export const verifyEmail = async (
  token: string
): Promise<Response<VerifyEmailData>> => {
  // ...
};
```

### Services Layer

- **Function**: `{action}{Resource}` (camelCase) - Ugyanaz mint az action
- **Import alias**: Ha szükséges, használj `as` aliast az ütközések elkerülésére

**Examples**:

```typescript
// File: login-user.ts
export const loginUser = async (
  values: LoginInput
): Promise<Response<LoginUserData>> => {
  // ...
};
```

```typescript
// File: reset-password.ts
export const resetPassword = async (
  values: ResetInput
): Promise<Response<ResetPasswordData>> => {
  // ...
};
```

### Data Layer

- **Function**: `{verb}{Resource}{ByCriteria}` (camelCase)
- **Examples**:
  - `getUserByEmail(email: string)`
  - `getUserById(id: string)`
  - `getVerificationTokenByToken(token: string)`
  - `getPasswordResetTokenByEmail(email: string)`
  - `verifyUserCredentials(email: string, password: string)`

---

## 📋 Complete Mapping

| **Feature**     | **Action File**      | **Action Export** | **Service File**     | **Service Export** |
| --------------- | -------------------- | ----------------- | -------------------- | ------------------ |
| Login           | `login-user.ts`      | `loginUser`       | `login-user.ts`      | `loginUser`        |
| Register        | `register-user.ts`   | `registerUser`    | `register-user.ts`   | `registerUser`     |
| Verify Email    | `verify-email.ts`    | `verifyEmail`     | `verify-email.ts`    | `verifyEmail`      |
| Reset Password  | `reset-password.ts`  | `resetPassword`   | `reset-password.ts`  | `resetPassword`    |
| Update Password | `update-password.ts` | `updatePassword`  | `update-password.ts` | `updatePassword`   |

---

## 📝 JSDoc Requirements

Minden public function-nek rendelkeznie kell részletes JSDoc kommenttel:

```typescript
/**
 * Core service to authenticate a user with email and password credentials.
 *
 * This service validates credentials via the data layer, handles email verification
 * flows (sending verification emails for unverified accounts), and delegates session
 * creation to NextAuth's signIn function. It implements security best practices by
 * separating credential validation from session creation.
 *
 * @param values - Validated login input containing email and password.
 * @returns Response with user ID on success, or structured error on failure.
 *
 * @throws Never throws - all errors are returned as Response<T> error objects.
 *
 * @example
 * const result = await loginUser({ email: 'user@example.com', password: 'pass123' });
 * if (result.status === Status.Success) {
 *   console.log(result.data.userId);
 * }
 */
export const loginUser = async (
  values: LoginInput
): Promise<Response<LoginUserData>> => {
  // ...
};
```

### JSDoc Sections:

1. **Brief description** - Mit csinál a függvény
2. **Detailed description** - Hogyan működik, milyen side effect-ek vannak
3. **@param** - Paraméter leírások
4. **@returns** - Visszatérési érték leírása
5. **@throws** - Milyen hibákat dobhat (auth esetén: "Never throws")
6. **@example** - Használati példa

---

## 🎯 Import Guidelines

### Actions Import

```typescript
// ✅ CORRECT: Named imports from barrel file
import { loginUser, registerUser, verifyEmail } from '@/features/auth/actions';

// ❌ WRONG: Direct file imports
import { loginUser } from '@/features/auth/actions/login-user';
```

### Services Import (within actions)

```typescript
// ✅ CORRECT: Import with alias to avoid name collision
import { loginUser as loginUserService } from '@/features/auth/services';
// ✅ CORRECT: Named import from barrel
import { verifyEmail } from '@/features/auth/services';
```

### Data Layer Import

```typescript
// ✅ CORRECT: Named imports
import {
  getUserByEmail,
  verifyUserCredentials,
} from '@/features/auth/data/user';
import { getVerificationTokenByToken } from '@/features/auth/data/verification-token';
```

---

## 🔄 Migration Checklist

When adding a new action/service:

- [ ] File name kebab-case: `{action}-{resource}.ts`
- [ ] Export name camelCase: `{action}{Resource}`
- [ ] Type export PascalCase: `{Action}{Resource}Data`
- [ ] Full JSDoc comment for every public function
- [ ] Update Index.ts (barrel export)
- [ ] Write/update tests
- [ ] Update components with the new name
