---
description: 'Enterprise-Level Error Handling & Response Guidelines for Next.js + TypeScript'
applyTo: '**'
---

**Version:** 2.0  
**Last Updated:** October 2025  
**Target:** Next.js 15+, TypeScript 5+, PostgreSQL, NextAuth

---

## Overview

This document establishes a **unified, type-safe error handling pattern** for large-scale Next.js applications. The goal is to eliminate scattered `throw` statements, provide consistent client-side error handling, and enable extensibility across multiple features (auth, posts, bookmarks, etc.).

### Core Principles

1. **Single Return Type**: All server actions return `Response<T>`
2. **AppError-driven flow**: Expected, domain-level errors are represented with `AppError`. Services may throw `AppError` instances; server actions should catch them and convert to `Response<T>` using the helpers in `src/lib/response.ts` (for example `error`).
3. **Type Safety**: Status-driven flow using TypeScript discriminated unions
4. **Flat Structure**: No nested error objects, all properties at top level
5. **HTTP Standards**: Always use `HTTP_STATUS` constants, never magic numbers
6. **i18n Ready**: Error messages use translation keys with parameters
7. **Future-Proof**: Object-based constructors allow easy extension
8. **Race Condition Free**: State updates ordered correctly (setStatus last)

---

## 1. Response Pattern

### ✅ CORRECT: Unified Response Type with Status Enum

```typescript
// File: src/lib/response.ts

export enum Status {
  Idle = 'idle', // Initial state, no action performed yet
  Success = 'success', // Action completed successfully
  Error = 'error', // Action failed with error
  Pending = 'pending', // Action in progress
  Partial = 'partial', // Some operations succeeded, some failed
}

/**
 * Message type for i18n support
 * Simple string or i18n key with params for formatted messages
 */
export type Message =
  | string
  | { key: string; params?: Record<string, unknown> };

/**
 * Partial error type for batch operations
 */
export interface PartialError {
  code: string;
  error: Message;
  details?: unknown;
}

/**
 * Idle response - initial state, no action performed yet
 */
export interface IdleResponse {
  status: Status.Idle;
}

/**
 * Success response - contains data and optional success message
 */
export interface SuccessResponse<TData> {
  status: Status.Success;
  data: TData;
  success?: Message;
}

/**
 * Error response - all error details directly on response
 * No nested objects, simple and clear
 */
export interface ErrorResponse {
  status: Status.Error;
  error: Message; // Error message (string or i18n key)
  code: string; // Error code for programmatic handling
  httpStatus: number; // HTTP status code
  details?: unknown; // Additional error context
}

/**
 * Pending response - operation in progress
 */
export interface PendingResponse {
  status: Status.Pending;
}

/**
 * Partial response - some operations succeeded, some failed
 */
export interface PartialResponse<TData> {
  status: Status.Partial;
  data: TData;
  success?: Message;
  errors: PartialError[];
}

export type Response<TData> =
  | IdleResponse
  | SuccessResponse<TData>
  | ErrorResponse
  | PendingResponse
  | PartialResponse<TData>;
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
- Missing Idle state causes race conditions in client hooks

---

## 2. Helper Functions

### ✅ CORRECT: Factory Functions with Status Enum

// File: src/lib/response.ts

```typescript
/**
 * Create idle response
 */
export function idle(): IdleResponse {
  return {
    status: Status.Idle,
  };
}

/**
 * Create success response
 * @param data - The response data
 * @param success - Optional success message (string or i18n key with params)
 *
 * @example
 * success({ userId: '123' })
 * success({ userId: '123' }, 'Registration successful')
 * success({ userId: '123' }, { key: 'auth.success.registered', params: { email: 'user@example.com' } })
 */
export function success<TData>(
  data: TData,
  success?: Message
): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data,
    ...(success && { success }),
  };
}

/**
 * Create error response from AppError
 * Automatically serializes AppError for client-server communication
 *
 * @example
 * error(AuthErrors.INVALID_CREDENTIALS)
 */
export function error(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    error: error.errorMessage,
    code: error.code,
    httpStatus: error.httpStatus,
    details: error.details,
  };
}

/**
 * Create pending response
 */
export function pending(): PendingResponse {
  return {
    status: Status.Pending,
  };
}

/**
 * Create partial response - some operations succeeded, some failed
 */
export function partial<TData>(
  data: TData,
  errors: PartialError[],
  success?: Message
): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data,
    errors,
    ...(success && { success }),
  };
}

/**
 * Extract string from Message type (for display purposes)
 * Note: This only extracts the key, actual i18n formatting happens in components
 */
export function getMessage(msg: Message | undefined): string | undefined {
  if (!msg) return undefined;
  return typeof msg === 'string' ? msg : msg.key;
}

/**
 * Format a Message with i18n support
 *
 * @param msg - The message to format (string or i18n object)
 * @param translator - Optional translation function from your i18n library
 * @returns Formatted string message
 *
 * @example
 * // Without i18n (returns plain string or key)
 * formatMessage('Simple error message')
 *
 * @example
 * // With next-intl
 * import { useTranslations } from 'next-intl';
 * const t = useTranslations();
 * formatMessage(response.error, t)
 *
 * @example
 * // With react-i18next
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * formatMessage(response.error, t)
 */
export function formatMessage(
  msg: Message | undefined,
  translator?: (key: string, params?: Record<string, unknown>) => string
): string | undefined {
  if (!msg) return undefined;

  // Simple string message
  if (typeof msg === 'string') {
    return msg;
  }

  // i18n object with key and params
  if (translator) {
    return translator(msg.key, msg.params);
  }

  // Fallback: return key if no translator provided
  return msg.key;
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

// File: src/lib/http-status.ts

```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
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

// File: src/lib/errors/app-error.ts

```typescript
import { HTTP_STATUS, type HttpStatusCode } from '@/lib/http-status';
import { Message } from '@/lib/response';

interface AppErrorParams {
  code: string;
  message: Message; // Can be string or { key, params }
  httpStatus?: HttpStatusCode;
  details?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly errorMessage: Message; // Message type with i18n support
  public readonly httpStatus: HttpStatusCode;
  public readonly details?: unknown;

  constructor({
    code,
    message,
    httpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details,
  }: AppErrorParams) {
    // Call Error constructor with string representation for stack traces
    super(typeof message === 'string' ? message : message.key);
    this.code = code;
    this.errorMessage = message; // Store full Message type (string or i18n object)
    this.httpStatus = httpStatus;
    this.details = details;

    // Maintains correct stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
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

### ✅ CORRECT: Centralized helpers + messages + codes with i18n

The repository centralizes base error data and helpers across three files:

- `src/lib/errors/codes.ts` — `ERROR_CODES` and `ErrorCode` type (string constants)
- `src/lib/errors/messages.ts` — `ERROR_MESSAGES` (i18n keys)
- `src/lib/errors/helpers.ts` — factory helpers that create `AppError` instances (e.g. `internalServerError`, `validationFailed`, `unauthorized`, `forbidden`, `notFound`, `databaseError`)

Example (helpers usage):

// File: src/lib/errors/helpers.ts

```typescript
import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { ERROR_CODES } from './codes';
import { ERROR_MESSAGES } from './messages';

export const internalServerError = () =>
  new AppError({
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: { key: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

export const validationFailed = (details: unknown) =>
  new AppError({
    code: ERROR_CODES.VALIDATION_FAILED,
    message: { key: ERROR_MESSAGES.VALIDATION_FAILED },
    httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    details,
  });
```

Feature-specific errors (for example `features/auth/lib/errors.ts`) continue to define domain errors as `AppError` instances or factories and are exported from the feature. The package-level `src/lib/errors/index.ts` re-exports `AppError` and common helpers for convenience.

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

// File: src/features/auth/actions/register.ts

```typescript
'use server';

import { AuthErrorDefinitions as AuthErrors } from '@/features/auth/lib/errors';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser } from '@/features/auth/services';
import { type Response, error } from '@/lib/response';

/**
 * Register action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function register(
  values: RegisterInput
): Promise<Response<{ userId: string }>> {
  // 1. Validate input with Zod
  const validation = registerSchema.safeParse(values);
  if (!validation.success) {
    return error(AuthErrors.INVALID_FIELDS(validation.error.issues));
  }

  // 2. Call service layer - it returns Response<T>
  return await registerUser(validation.data);
}
```

### Example with success message:

```typescript
import { AUTH_UI_MESSAGES } from '@/features/auth/lib/messages';

// In service layer:
export async function registerUser(
  values: RegisterInput
): Promise<Response<{ userId: string }>> {
  // ... validation, user creation ...

  if (siteFeatures.emailVerification) {
    const verificationToken = generateVerificationToken(email);

    // Return success with message (second parameter)
    return success(
      { userId: email },
      { key: AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SENT, params: { email } }
      // Message shown to user
    );
  }

  // Return success without message (auto-redirect will happen)
  return success({ userId: email });
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

// File: src/features/auth/services/login.ts

```typescript
import { comparePasswords } from '@/lib/crypto';
import { invalidCredentials } from '@/lib/errors';
import { db } from '@/lib/prisma';
import { fail } from '@/lib/response';
import type { LoginInput } from '@/schemas/login';
import type { User } from '@/types';

export async function loginService(input: LoginInput): Promise<User> {
  // 1. Find user
  const user = await db.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    return fail(invalidCredentials());
  }

  // 2. Verify password
  const isValid = await comparePasswords(input.password, user.password);

  if (!isValid) {
    return fail(invalidCredentials());
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

### ✅ CORRECT: Using useAction hook with structured messages

// File: src/features/auth/components/register-form.tsx

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { LoadingButton } from '@/components/loading-button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { register } from '@/features/auth/actions';
import { useAuthAction } from '@/features/auth/hooks/use-auth-action';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';

export function RegisterForm() {
  // useAuthAction wraps useAction with redirect logic
  const { execute, message, isPending } = useAuthAction();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const onSubmit = (values: RegisterInput) => {
    execute(() => register(values));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isPending} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Display success/error messages */}
        <FormError message={message.error} />
        <FormSuccess message={message.success} />

        <LoadingButton type="submit" loading={isPending}>
          Register
        </LoadingButton>
      </form>
    </Form>
  );
}
```

### useAction hook implementation:

File: src/hooks/use-action.ts

```typescript
'use client';

import { useCallback, useState, useTransition } from 'react';

import type { Message, Response } from '@/lib/response';
import { Status, getMessage } from '@/lib/response';

export function useAction<TData>() {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(
    async (action: () => Promise<Response<TData>>): Promise<void> => {
      setErrorMsg(undefined);
      setSuccessMsg(undefined);
      setStatus(Status.Pending);

      startTransition(async () => {
        try {
          const response = await action();

          switch (response.status) {
            case Status.Success:
              setData(response.data);
              setSuccessMsg(getMessage(response.success));
              setStatus(response.status); // IMPORTANT: Set status LAST
              break;

            case Status.Error:
              setErrorMsg(getMessage(response.error));
              setStatus(response.status); // IMPORTANT: Set status LAST
              break;

            case Status.Partial:
              setData(response.data);
              setSuccessMsg(getMessage(response.success));
              if (response.errors.length > 0) {
                setErrorMsg(getMessage(response.errors[0].error));
              }
              setStatus(response.status); // IMPORTANT: Set status LAST
              break;

            case Status.Pending:
              setStatus(response.status);
              break;
          }
        } catch (err) {
          setErrorMsg('An unexpected error occurred. Please try again.');
          setStatus(Status.Error); // IMPORTANT: Set status LAST
          console.error('useAction error:', err);
        }
      });
    },
    []
  );

  const reset = useCallback(() => {
    setStatus(Status.Idle);
    setSuccessMsg(undefined);
    setErrorMsg(undefined);
    setData(undefined);
  }, []);

  return {
    execute,
    reset,
    status,
    message: {
      success: successMsg,
      error: errorMsg,
    },
    data,
    isPending: status === Status.Pending || isPending,
  };
}
```

### useAuthAction with redirect logic:

// File: src/features/auth/hooks/use-auth-action.tsx

```typescript
'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useAction } from '@/hooks/use-action';
import { type Response, Status } from '@/lib/response';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

export function useAuthAction<TData>(options: { redirectTo?: string } = {}) {
  const router = useRouter();
  const actionState = useAction<TData>();
  const hasRedirectedRef = useRef(false);

  const { redirectTo = DEFAULT_LOGIN_REDIRECT } = options;

  const execute = useCallback(
    async (action: () => Promise<Response<TData>>): Promise<void> => {
      hasRedirectedRef.current = false;
      await actionState.execute(action);
    },
    [actionState]
  );

  // Handle redirect on success (only if no success message)
  useEffect(() => {
    if (actionState.status === Status.Success && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      // If success message exists, don't redirect (show message instead)
      if (actionState.message.success) {
        return;
      }

      // No message, redirect to target page
      router.push(redirectTo);
    }
  }, [actionState.status, actionState.message.success, redirectTo, router]);

  return actionState;
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

## 9. Batch Operations (Partial Responses)

### ✅ CORRECT: Using partial status

// File: src/features/bookmarks/actions/delete-many.ts

```typescript
'use server';

import { AppError } from '@/lib/errors/app-error';
import { error, partial, success } from '@/lib/response';
import type { Response } from '@/lib/response';

import { deleteBookmarkService } from '../services/delete-bookmark';

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
        errors.push({
          code: error.code,
          error: error.errorMessage,
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
    return error(errors[0]); // Return first error as AppError
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

## 10. Rules Summary

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
11. **Log unexpected errors** before returning `INTERNAL_SERVER_ERROR`
12. **Initialize hook state with `Status.Idle`** to prevent race conditions
13. **Set status LAST** in state updates (setData/setMsg first, setStatus last)

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
13. **Don't start with `Status.Pending`** as initial state (causes disabled forms)
14. **Don't call `setStatus()` before setting data/messages** (causes race conditions)

---

## 11. File Structure

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

## 12. TypeScript Configuration

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

## 13. Testing

### ✅ CORRECT: Testing error responses

// File: src/features/auth/**tests**/login.test.ts

```typescript
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

## 14. i18n Message Files

### Example i18n structure

// File: src/i18n/messages/en.json

```json
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
      "email_already_exists": "This email is already registered.",
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
✅ **Race Condition Free**: State updates ordered correctly (setStatus last)

Follow these guidelines for all new features and refactor existing code to match this pattern.
