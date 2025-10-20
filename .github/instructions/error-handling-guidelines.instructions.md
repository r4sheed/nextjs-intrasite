---
description: 'Enterprise-Level Error Handling & Response Guidelines for Next.js + TypeScript'
applyTo: '**'
---

**Version:** 1.0  
**Last Updated:** October 2025  
**Target:** Next.js 15+, TypeScript 5+, PostgreSQL, NextAuth

---

## Overview

This document establishes a **unified, type-safe error handling pattern** for large-scale Next.js applications. The goal is to eliminate scattered `throw` statements, provide consistent client-side error handling, and enable extensibility across multiple features (auth, posts, bookmarks, etc.).

### Core Principles

1. **Single Return Type**: All server actions return `Response<T>`
2. **No Throws**: Expected errors are handled via `AppError` and returned, not thrown
3. **Type Safety**: Status-driven flow using TypeScript discriminated unions
4. **Composability**: Feature-specific errors extend base definitions without modification
5. **HTTP Standards**: Always use `HTTP_STATUS` constants, never magic numbers
6. **i18n Ready**: Error messages use translation keys with parameters
7. **Future-Proof**: Object-based constructors allow easy extension

---

## 1. Response Pattern

### ✅ CORRECT: Unified Response Type with Status Enum

```typescript
// File: src/lib/response.ts

export enum Status {
  Success = 'success',
  Error = 'error',
  Pending = 'pending',
  Partial = 'partial',
}

export interface ErrorResponse {
  status: Status.Error;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface SuccessResponse<TData> {
  status: Status.Success;
  data: TData;
}

export interface PartialError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PartialResponse<TData> {
  status: Status.Partial;
  data: TData;
  errors?: PartialError[];
}

export interface PendingResponse {
  status: Status.Pending;
}

export type Response<TData> =
  | SuccessResponse<TData>
  | ErrorResponse
  | PartialResponse<TData>
  | PendingResponse;
```

### ❌ WRONG: String literal types without enum

```typescript
// DON'T DO THIS
export type BadStatus = 'success' | 'error'; // ❌ Hard to maintain
export interface BadResponse<T> {
  status: BadStatus;
  data?: T;
  error?: string;
}
```

**Why wrong:**

- No single source of truth for status values
- Not type-safe (data might be undefined even when status is 'success')
- String errors are not structured

---

## 2. Helper Functions

### ✅ CORRECT: Factory Functions with Status Enum

```typescript
// File: src/lib/response.ts

export function success<TData>(data: TData): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data,
  };
}

export function failure(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    error: {
      code: error.code,
      message:
        typeof error.message === 'string' ? error.message : error.message.key,
      details: error.details,
    },
  };
}

export function partial<TData>(
  data: TData,
  errors?: PartialError[]
): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data,
    errors,
  };
}

export function pending(): PendingResponse {
  return {
    status: Status.Pending,
  };
}
```

### ❌ WRONG: Throwing errors from server actions

```typescript
// DON'T DO THIS
export async function badLoginAction(data: LoginInput) {
  const user = await db.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new Error('User not found'); // ❌ Throws to client
  }
  return user;
}
```

**Why wrong:**

- Uncaught errors crash the application or show generic error boundaries
- No structured error information for the client
- Not type-safe

---

## 3. HTTP Status Constants

### ✅ CORRECT: Centralized constants with type

```typescript
// File: src/lib/http-status.ts

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
```

### ❌ WRONG: Magic numbers

```typescript
// DON'T DO THIS
return new AppError({
  code: 'NOT_FOUND',
  message: 'User not found',
  httpStatus: 404, // ❌ Magic number
});
```

**Why wrong:**

- Hard to maintain and search
- Prone to typos
- No single source of truth

---

## 4. AppError Class (Object-Based Constructor)

### ✅ CORRECT: Object-based constructor with i18n support

```typescript
// File: src/lib/errors/app-error.ts
import { HTTP_STATUS, type HttpStatus } from '@/lib/http-status';

interface AppErrorParams {
  code: string;
  message: string | { key: string; params?: Record<string, unknown> };
  httpStatus?: HttpStatus;
  details?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly message:
    | string
    | { key: string; params?: Record<string, unknown> };
  public readonly httpStatus: HttpStatus;
  public readonly details?: unknown;

  constructor({
    code,
    message,
    httpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details,
  }: AppErrorParams) {
    super(typeof message === 'string' ? message : message.key);
    this.code = code;
    this.message = message;
    this.httpStatus = httpStatus;
    this.details = details;

    // Maintains correct stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}
```

### ❌ WRONG: Positional parameters

```typescript
// DON'T DO THIS
export class BadAppError extends Error {
  constructor(
    code: string,
    message: string,
    httpStatus: number, // ❌ Hard to extend
    details?: unknown
  ) {
    super(message);
    // ...
  }
}
```

**Why wrong:**

- Hard to add new optional parameters
- Order matters, making it error-prone
- Not future-proof

**✅ Advantage of object-based constructor:**

- Easy to extend with new optional properties
- Named parameters improve readability
- Future-proof for adding metadata, i18n params, etc.

---

## 5. Error Definitions

### ✅ CORRECT: Centralized with composition and i18n

```typescript
// File: src/lib/errors/definitions.ts
import { HTTP_STATUS } from '@/lib/http-status';

import { AppError } from './app-error';

export const BaseErrorDefinitions = {
  INTERNAL_SERVER_ERROR: new AppError({
    code: 'INTERNAL_SERVER_ERROR',
    message: { key: 'errors.internal_server_error' },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  }),

  VALIDATION_FAILED: (details: unknown) =>
    new AppError({
      code: 'VALIDATION_FAILED',
      message: { key: 'errors.validation_failed' },
      httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details,
    }),
} as const;
```

```typescript
// File: src/features/auth/lib/errors.ts
import { AppError } from '@/lib/errors/app-error';
import { HTTP_STATUS } from '@/lib/http-status';

export const AuthErrorDefinitions = {
  INVALID_CREDENTIALS: new AppError({
    code: 'AUTH_INVALID_CREDENTIALS',
    message: { key: 'auth.errors.invalid_credentials' },
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
  }),

  EMAIL_IN_USE: new AppError({
    code: 'AUTH_EMAIL_IN_USE',
    message: { key: 'auth.errors.email_in_use' },
    httpStatus: HTTP_STATUS.CONFLICT,
  }),

  USER_NOT_FOUND: (email: string) =>
    new AppError({
      code: 'AUTH_USER_NOT_FOUND',
      message: {
        key: 'auth.errors.user_not_found',
        params: { email },
      },
      httpStatus: HTTP_STATUS.NOT_FOUND,
      details: { email },
    }),
} as const;
```

```typescript
// File: src/features/posts/lib/errors.ts
import { AppError } from '@/lib/errors/app-error';
import { HTTP_STATUS } from '@/lib/http-status';

export const PostErrorDefinitions = {
  FILE_TOO_LARGE: (maxSize: number) =>
    new AppError({
      code: 'POST_FILE_TOO_LARGE',
      message: {
        key: 'posts.errors.file_too_large',
        params: { maxSize },
      },
      httpStatus: HTTP_STATUS.CONFLICT,
      details: { maxSize },
    }),

  POST_NOT_FOUND: (id: string) =>
    new AppError({
      code: 'POST_NOT_FOUND',
      message: {
        key: 'posts.errors.post_not_found',
        params: { id },
      },
      httpStatus: HTTP_STATUS.NOT_FOUND,
      details: { id },
    }),
} as const;
```

```typescript
// File: src/lib/errors/index.ts
import { AuthErrorDefinitions } from '@/features/auth/lib/errors';
import { PostErrorDefinitions } from '@/features/posts/lib/errors';

import { BaseErrorDefinitions } from './definitions';

export const ErrorDefinitions = {
  ...BaseErrorDefinitions,
  ...AuthErrorDefinitions,
  ...PostErrorDefinitions,
} as const;

export { AppError } from './app-error';
```

### ❌ WRONG: Hardcoded strings without i18n

```typescript
// DON'T DO THIS
export const BadErrors = {
  USER_NOT_FOUND: new AppError({
    code: 'USER_NOT_FOUND',
    message: 'User not found', // ❌ Not translatable
    httpStatus: HTTP_STATUS.NOT_FOUND,
  }),
};
```

**Why wrong:**

- Cannot be translated
- No parameter interpolation
- Not scalable for international applications

---

## 6. Server Actions

### ✅ CORRECT: Type-safe server action with Response<T>

```typescript
// File: src/features/auth/actions/login.ts

'use server';

import type { User } from '@/features/auth/types';
import { BaseErrorDefinitions } from '@/lib/errors/definitions';
import { failure, success } from '@/lib/response';
import { Status } from '@/lib/response';
import type { Response } from '@/lib/response';

import { loginSchema } from '../schemas/login';
import { loginService } from '../services/login';

// File: src/features/auth/actions/login.ts

// File: src/features/auth/actions/login.ts

// File: src/features/auth/actions/login.ts

// File: src/features/auth/actions/login.ts

export async function loginAction(formData: FormData): Promise<Response<User>> {
  try {
    // 1. Parse and validate input
    const rawData = Object.fromEntries(formData);
    const validation = loginSchema.safeParse(rawData);

    if (!validation.success) {
      return failure(
        BaseErrorDefinitions.VALIDATION_FAILED(validation.error.flatten())
      );
    }

    // 2. Call service layer
    const result = await loginService(validation.data);

    // 3. Return success
    return success(result);
  } catch (error) {
    // 4. Handle unexpected errors
    console.error('Login action error:', error);

    // If it's an AppError, return it
    if (error instanceof AppError) {
      return failure(error);
    }

    // Otherwise, return generic error
    return failure(BaseErrorDefinitions.INTERNAL_SERVER_ERROR);
  }
}
```

### ❌ WRONG: Throwing errors or untyped returns

```typescript
// DON'T DO THIS
export async function badLoginAction(formData: FormData) {
  const data = Object.fromEntries(formData);

  // ❌ No validation
  const user = await db.user.findUnique({
    where: { email: data.email as string },
  });

  if (!user) {
    throw new Error('User not found'); // ❌ Throws
  }

  return user; // ❌ No Response wrapper
}
```

**Why wrong:**

- No input validation
- Throws errors to client
- Return type is not `Response<T>`
- Type casting (`as string`) is unsafe

---

## 7. Service Layer

### ✅ CORRECT: Service throws AppError

```typescript
// File: src/features/auth/services/login.ts
import { comparePasswords } from '@/lib/crypto';
import { db } from '@/lib/prisma';

import { AuthErrorDefinitions } from '../lib/errors';
import type { LoginInput } from '../schemas/login';
import type { User } from '../types';

export async function loginService(input: LoginInput): Promise<User> {
  // 1. Find user
  const user = await db.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw AuthErrorDefinitions.INVALID_CREDENTIALS;
  }

  // 2. Verify password
  const isValid = await comparePasswords(input.password, user.password);

  if (!isValid) {
    throw AuthErrorDefinitions.INVALID_CREDENTIALS;
  }

  // 3. Return user (without password)
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}
```

### ❌ WRONG: Service returns null or boolean

```typescript
// DON'T DO THIS
export async function badLoginService(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    return null; // ❌ Returning null
  }

  return user; // ❌ Returns user with password
}
```

**Why wrong:**

- No structured error
- Caller must check for `null`
- Password not hashed
- Returns sensitive data

---

## 8. Client-Side Handling

### ✅ CORRECT: Status-driven UI logic with i18n

```typescript
// File: src/features/auth/components/login-form.tsx

'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl'; // or your i18n solution
import { loginAction } from '../actions/login';
import { Status } from '@/lib/response';
import { toast } from 'sonner';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await loginAction(formData);

      switch (response.status) {
        case Status.Success:
          toast.success(t('auth.success.login'));
          // response.data is typed as User
          console.log(response.data.email);
          break;

        case Status.Error:
          // Handle i18n message
          const errorMessage = typeof response.error.message === 'string'
            ? response.error.message
            : t(response.error.message.key, response.error.message.params);

          toast.error(errorMessage);
          console.error('Error code:', response.error.code);
          break;

        case Status.Pending:
          // Handle pending state if needed
          break;
      }
    });
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? t('common.loading') : t('auth.buttons.login')}
      </button>
    </form>
  );
}
```

### ❌ WRONG: Untyped error handling without i18n

```typescript
// DON'T DO THIS
async function badHandleSubmit(formData: FormData) {
  try {
    const result = await badLoginAction(formData);

    if (result) {
      console.log('Success');
    }
  } catch (error) {
    alert('Login failed'); // ❌ Generic message, no i18n
  }
}
```

**Why wrong:**

- No type safety
- Catches unexpected errors
- No structured error information
- No i18n support
- Poor UX

---

## 9. useApiResponse Hook

### ✅ CORRECT: Reusable hook for API response state

```typescript
// File: src/hooks/use-api-response.ts
import { useState, useTransition } from 'react';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { type Response, Status } from '@/lib/response';

interface UseApiResponseOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: {
    code: string;
    message: string;
    details?: unknown;
  }) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useApiResponse<TData>(
  options: UseApiResponseOptions<TData> = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<{
    code: string;
    message: string;
    details?: unknown;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations();

  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
  } = options;

  async function execute<TResult = TData>(
    action: () => Promise<Response<TResult>>
  ): Promise<Response<TResult>> {
    setError(null);

    return new Promise(resolve => {
      startTransition(async () => {
        const response = await action();

        switch (response.status) {
          case Status.Success:
            setData(response.data as unknown as TData);

            if (showSuccessToast) {
              toast.success(successMessage || t('common.success'));
            }

            onSuccess?.(response.data as unknown as TData);
            break;

          case Status.Error:
            const errorMessage =
              typeof response.error.message === 'string'
                ? response.error.message
                : t(response.error.message.key, response.error.message.params);

            const errorObj = {
              code: response.error.code,
              message: errorMessage,
              details: response.error.details,
            };

            setError(errorObj);

            if (showErrorToast) {
              toast.error(errorMessage);
            }

            onError?.(errorObj);
            break;

          case Status.Partial:
            setData(response.data as unknown as TData);

            if (response.errors && response.errors.length > 0) {
              const firstError = response.errors[0];
              const partialErrorMessage =
                typeof firstError.message === 'string'
                  ? firstError.message
                  : t(firstError.message.key, firstError.message.params);

              if (showErrorToast) {
                toast.warning(partialErrorMessage);
              }
            }
            break;

          case Status.Pending:
            // Handle pending if needed
            break;
        }

        resolve(response);
      });
    });
  }

  function reset() {
    setData(null);
    setError(null);
  }

  return {
    data,
    error,
    isPending,
    execute,
    reset,
  };
}
```

### Usage Example

```typescript
// File: src/features/auth/components/login-form-with-hook.tsx

'use client';

import { useApiResponse } from '@/hooks/use-api-response';
import { loginAction } from '../actions/login';
import type { User } from '../types';

export function LoginFormWithHook() {
  const { execute, isPending, error } = useApiResponse<User>({
    onSuccess: (user) => {
      console.log('Logged in:', user.email);
      // Redirect or update state
    },
    successMessage: 'Welcome back!',
  });

  async function handleSubmit(formData: FormData) {
    await execute(() => loginAction(formData));
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div className="error">
          {error.message}
          <small>Code: {error.code}</small>
        </div>
      )}

      <input type="email" name="email" required />
      <input type="password" name="password" required />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
```

### ❌ WRONG: Scattered state management

```typescript
// DON'T DO THIS
function BadLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await loginAction(formData);
      setData(result);
    } catch (err) {
      setError('Something went wrong'); // ❌ Generic error
    } finally {
      setLoading(false);
    }
  }
  // ...
}
```

**Why wrong:**

- Repeated boilerplate in every form
- No type safety
- No i18n support
- No toast notifications
- Hard to maintain

---

## 10. Batch Operations (Partial Responses)

### ✅ CORRECT: Using partial status

```typescript
// File: src/features/bookmarks/actions/delete-many.ts

'use server';

import { AppError } from '@/lib/errors/app-error';
import { failure, partial, success } from '@/lib/response';
import type { Response } from '@/lib/response';
import type { PartialError } from '@/lib/response';

import { deleteBookmarkService } from '../services/delete-bookmark';

// File: src/features/bookmarks/actions/delete-many.ts

// File: src/features/bookmarks/actions/delete-many.ts

// File: src/features/bookmarks/actions/delete-many.ts

// File: src/features/bookmarks/actions/delete-many.ts

export async function deleteManyBookmarksAction(
  ids: string[]
): Promise<Response<{ deletedIds: string[] }>> {
  const deletedIds: string[] = [];
  const errors: PartialError[] = [];

  for (const id of ids) {
    try {
      await deleteBookmarkService(id);
      deletedIds.push(id);
    } catch (error) {
      if (error instanceof AppError) {
        const errorMessage =
          typeof error.message === 'string' ? error.message : error.message.key;

        errors.push({
          code: error.code,
          message: errorMessage,
          details: { id },
        });
      }
    }
  }

  // All succeeded
  if (errors.length === 0) {
    return success({ deletedIds });
  }

  // All failed
  if (deletedIds.length === 0) {
    return failure(errors[0] as any);
  }

  // Partial success
  return partial({ deletedIds }, errors);
}
```

### ❌ WRONG: All-or-nothing approach

```typescript
// DON'T DO THIS
export async function badDeleteMany(ids: string[]) {
  for (const id of ids) {
    await deleteBookmark(id); // ❌ If one fails, all fail
  }
  return { success: true };
}
```

**Why wrong:**

- No graceful degradation
- User doesn't know which items succeeded
- Poor UX for batch operations

---

## 11. Rules Summary

### MUST DO ✅

1. **Always return `Response<T>`** from server actions
2. **Use `Status` enum** for all status values
3. **Use `AppError` with object-based constructor** for all expected errors
4. **Use `HTTP_STATUS` constants** for all HTTP status codes
5. **Compose error definitions** using spread operator (never modify base file)
6. **Validate input** with Zod or similar before processing
7. **Use status checks** (`response.status === Status.Success`) on client
8. **Throw `AppError` in services**, catch in actions
9. **Use i18n keys with params** for error messages
10. **Use `partial` status** for batch operations with mixed results
11. **Use `useApiResponse` hook** to reduce boilerplate
12. **Log unexpected errors** before returning `INTERNAL_SERVER_ERROR`

### NEVER DO ❌

1. **Don't throw generic `Error`** from server actions
2. **Don't use magic numbers** for HTTP status codes
3. **Don't use string literals** for status without enum
4. **Don't return boolean** `success` flags
5. **Don't modify base error definitions** for new features
6. **Don't return `null` or `undefined`** to indicate errors
7. **Don't expose sensitive data** in error details
8. **Don't use `try/catch` on client** to handle server action errors
9. **Don't use `alert()`** or generic error messages
10. **Don't skip input validation**
11. **Don't mix error handling patterns** across features
12. **Don't use positional parameters** in AppError constructor

---

## 12. File Structure

```
src/
├── lib/
│   ├── http-status.ts          # HTTP status constants
│   ├── response.ts              # Response types, Status enum & helpers
│   └── errors/
│       ├── app-error.ts         # AppError class
│       ├── definitions.ts       # Base error definitions
│       └── index.ts             # Exports all errors
│
├── hooks/
│   └── use-api-response.ts     # Reusable API response hook
│
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   │   ├── login.ts         # Server action
│   │   │   └── register.ts
│   │   ├── services/
│   │   │   ├── login.ts         # Business logic
│   │   │   └── register.ts
│   │   ├── schemas/
│   │   │   ├── login.ts         # Zod schemas
│   │   │   └── register.ts
│   │   ├── lib/
│   │   │   └── errors.ts        # Auth-specific errors
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── posts/
│   │   ├── lib/
│   │   │   └── errors.ts        # Post-specific errors
│   │   └── ...
│   │
│   └── bookmarks/
│       ├── lib/
│       │   └── errors.ts        # Bookmark-specific errors
│       └── ...
```

---

## 13. TypeScript Configuration

Ensure strict mode is enabled:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 14. Testing

### ✅ CORRECT: Testing error responses

```typescript
// File: src/features/auth/__tests__/login.test.ts
import { describe, expect, it, vi } from 'vitest';

import { Status } from '@/lib/response';

import { loginAction } from '../actions/login';
import { AuthErrorDefinitions } from '../lib/errors';

describe('loginAction', () => {
  it('should return error for invalid credentials', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');

    const response = await loginAction(formData);

    expect(response.status).toBe(Status.Error);
    if (response.status === Status.Error) {
      expect(response.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    }
  });

  it('should return success for valid credentials', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'correctpassword');

    const response = await loginAction(formData);

    expect(response.status).toBe(Status.Success);
    if (response.status === Status.Success) {
      expect(response.data).toHaveProperty('email');
      expect(response.data.email).toBe('test@example.com');
    }
  });
});
```

---

## 15. i18n Message Files

### Example i18n structure

```json
// File: src/i18n/messages/en.json

{
  "common": {
    "success": "Operation completed successfully",
    "loading": "Loading..."
  },
  "errors": {
    "internal_server_error": "An unexpected error occurred. Please try again.",
    "validation_failed": "Input validation failed. Please check your entries."
  },
  "auth": {
    "errors": {
      "invalid_credentials": "Invalid email or password.",
      "email_in_use": "This email is already registered.",
      "user_not_found": "User with email {email} could not be found."
    },
    "success": {
      "login": "Welcome back!",
      "register": "Account created successfully!"
    },
    "buttons": {
      "login": "Log in",
      "register": "Sign up"
    }
  },
  "posts": {
    "errors": {
      "file_too_large": "The uploaded file exceeds the maximum allowed size of {maxSize}MB.",
      "post_not_found": "Post with ID {id} could not be found."
    }
  }
}
```

---

## Conclusion

This pattern provides:

✅ **Type Safety**: TypeScript ensures correct handling at compile time  
✅ **Scalability**: Easy to add new features without modifying core files  
✅ **Consistency**: All features follow the same error handling pattern  
✅ **Developer Experience**: Clear, predictable API for handling responses  
✅ **User Experience**: Structured errors enable better error messages  
✅ **i18n Support**: Built-in internationalization for all messages  
✅ **Testability**: Responses are easy to test and mock  
✅ **Maintainability**: Single source of truth for errors and statuses  
✅ **Future-Proof**: Object-based constructors allow easy extension  
✅ **Reduced Boilerplate**: `useApiResponse` hook eliminates repetitive code

Follow these guidelines for all new features and refactor existing code to match this pattern.
