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
9. **Data Layer Never Throws**: Data access layer returns `null` on errors and logs them; service layer handles all error responses
10. **Naming Conventions**: Follow [messages-and-codes.instructions.md](messages-and-codes.instructions.md) for error codes, messages, and i18n keys (camelCase properties, kebab-case values)

### Layer Responsibilities

**Data Layer** (`features/*/data/*.ts`):

- ✅ Returns `null` when entity not found (expected case)
- ✅ Returns `null` on database errors (logs error to console)
- ✅ Never throws errors
- ✅ Pure data access functions

**Service Layer** (`features/*/services/*.ts`):

- ✅ Calls data layer functions
- ✅ Returns `Response<T>` with domain errors (`response.error()`)
- ✅ Handles business logic validation
- ✅ May use try-catch for unexpected errors only

**Action Layer** (`features/*/actions/*.ts`):

- ✅ Always returns `Response<T>`
- ✅ Validates input with Zod schemas
- ✅ Calls service layer
- ✅ Never throws errors to client

---

## 1. Response Pattern

### ✅ CORRECT: Unified Response Type with Status Enum

```typescript
// File: src/lib/result.ts

export enum Status {
  Success = 'success', // Action completed successfully
  Error = 'error', // Action failed with error
  Partial = 'partial', // Some operations succeeded, some failed
}

/**
 * Message type for i18n support
 * Can be a simple string or an i18n key with optional parameters
 */
export type Message = { key: string; params?: Record<string, unknown> };

/**
 * Represents an individual error in a partial operation
 */
export interface PartialError {
  code: string;
  message: Message;
  details?: unknown;
}

/**
 * Response when an action is successful
 */
export interface SuccessResponse<TData> {
  status: Status.Success;
  data: TData;
  message?: Message;
}

/**
 * Response when an error occurs
 */
export interface ErrorResponse {
  status: Status.Error;
  message: Message; // Error message as i18n key
  code: string; // Error code for programmatic handling
  httpStatus: number; // HTTP status code
  details?: unknown; // Additional error context
}

/**
 * Response when some operations succeed and some fail
 */
export interface PartialResponse<TData> {
  status: Status.Partial;
  data: TData;
  message?: Message;
  errors: PartialError[];
}

/**
 * Union type of all possible server responses
 */
export type Response<TData> =
  | SuccessResponse<TData>
  | ErrorResponse
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

// File: src/lib/result.ts

```typescript
/**
 * Create a success response
 * @param data - The response payload
 * @param message - Optional success message (i18n object)
 * @returns {SuccessResponse<TData>}
 * @example
 * success({ data: { userId: '123' } })
 * success({ data: { userId: '123' }, message: { key: 'auth.success.registered', params: { email: 'user@example.com' } } })
 */
export function success<TData>(options: {
  data: TData;
  message?: Message;
}): SuccessResponse<TData> {
  return {
    status: Status.Success,
    data: options.data,
    ...(options.message && { message: options.message }),
  } as const;
}

/**
 * Create an error response from an AppError
 * Automatically serializes AppError for client-server communication
 *
 * @example
 * error(invalidCredentials())
 */
export function error(error: AppError): ErrorResponse {
  return {
    status: Status.Error,
    message: error.errorMessage,
    code: error.code,
    httpStatus: error.httpStatus,
    details: error.details,
  } as const;
}

/**
 * Create a partial response - some operations succeeded, some failed
 * @param data - The successful data
 * @param errors - List of partial errors
 * @param message - Optional message
 * @returns {PartialResponse<TData>}
 * @example
 * partial({ data: [{ id: 1 }, { id: 2 }], errors: [{ code: 'FAIL_3', message: { key: 'errors.process_failed' } }] });
 */
export function partial<TData>(options: {
  data: TData;
  errors: PartialError[];
  message?: Message;
}): PartialResponse<TData> {
  return {
    status: Status.Partial,
    data: options.data,
    errors: options.errors,
    ...(options.message && { message: options.message }),
  } as const;
}

/**
 * Convenience object containing all response factory functions
 * @example
 * import { response } from '@/lib/response';
 * return response.success({ data });
 */
export const response = {
  success,
  error,
  partial,
};

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
 * @param msg - The message to format (i18n object)
 * @param translator - Optional translation function from your i18n library
 * @returns Formatted string message
 *
 * @example
 * // Without i18n (returns key)
 * formatMessage({ key: 'auth.success' })
 *
 * @example
 * // With next-intl
 * import { useTranslations } from 'next-intl';
 * const t = useTranslations();
 * formatMessage(response.message, t)
 *
 * @example
 * // With react-i18next
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * formatMessage(response.message, t)
 */
export function formatMessage(
  msg: Message | undefined,
  translator?: (key: string, params?: Record<string, unknown>) => string
): string | undefined {
  if (!msg) return undefined;

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

> **Note:** For detailed naming conventions for error codes, messages, and i18n keys (camelCase vs kebab-case, property naming, etc.), see [messages-and-codes.instructions.md](messages-and-codes.instructions.md).

### ✅ CORRECT: Centralized helpers + messages + codes with i18n

The repository centralizes base error data and helpers across three files:

- `src/lib/errors/codes.ts` — `CORE_CODES` constants (camelCase properties, kebab-case values)
- `src/lib/errors/messages.ts` — `CORE_ERRORS` (i18n keys with camelCase properties, kebab-case values)
- `src/lib/errors/helpers.ts` — factory helpers that create `AppError` instances (e.g. `internalServerError`, `validationFailed`, `unauthorized`, `forbidden`, `notFound`, `databaseError`)

Example (helpers usage):

// File: src/lib/errors/helpers.ts

```typescript
import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { CORE_CODES } from './codes';
import { CORE_ERRORS } from './messages';

export const internalServerError = () =>
  new AppError({
    code: CORE_CODES.internalServerError,
    message: { key: CORE_ERRORS.internalServerError },
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

export const validationFailed = (details: unknown) =>
  new AppError({
    code: CORE_CODES.validationFailed,
    message: { key: CORE_ERRORS.validationFailed },
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

import { z } from 'zod';

import { validationFailed } from '@/lib/errors';
import { type Response, response } from '@/lib/response';

import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { registerUser } from '@/features/auth/services';
import type { RegisterUserData } from '@/features/auth/services/register-user';

/**
 * Register action - validates input and calls service
 * Always returns Response<T>, never throws
 */
export async function register(
  values: RegisterInput
): Promise<Response<RegisterUserData>> {
  // 1. Validate input with Zod
  const validation = registerSchema.safeParse(values);
  if (!validation.success) {
    return response.failure(validationFailed(validation.error));
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

    // Return success with message
    return response.success({
      data: { userId: email },
      message: {
        key: AUTH_UI_MESSAGES.EMAIL_VERIFICATION_SENT,
        params: { email },
      },
      // Message shown to user
    });
  }

  // Return success without message (auto-redirect will happen)
  return response.success({ data: { userId: email } });
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
import { internalServerError } from '@/lib/errors';
import { db } from '@/lib/prisma';
import { type Response, response } from '@/lib/response';

import { invalidCredentials } from '@/features/auth/lib/errors';

import type { LoginInput } from '@/features/auth/schemas';
import type { User } from '@/types';

export async function loginUser(input: LoginInput): Promise<Response<User>> {
  try {
    // 1. Find user
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      return response.error(invalidCredentials());
    }

    // 2. Verify password
    const isValid = await comparePasswords(input.password, user.password);

    if (!isValid) {
      return response.error(invalidCredentials());
    }

    // 3. Return success response (without password)
    const { password, ...userWithoutPassword } = user;
    return response.success({ data: userWithoutPassword as User });
  } catch (error) {
    // Log unexpected errors
    console.error('Login error:', error);
    return response.error(internalServerError());
  }
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

### ✅ CORRECT: Using TanStack Query mutation with execute adapter

// File: src/features/auth/components/login-form.tsx

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { LoadingButton } from '@/components/loading-button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type LoginData, login } from '@/features/auth/actions';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { execute } from '@/hooks/use-action';
import { type ErrorResponse, type SuccessResponse } from '@/lib/response';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';

export function LoginForm() {
  const router = useRouter();

  // TanStack Query mutation for the login action
  const mutation = useMutation<
    SuccessResponse<LoginData>, // TData: Successful return type
    ErrorResponse, // TError: Thrown error type (from the 'execute' adapter)
    LoginInput // TVariables: Input data type
  >({
    mutationFn: data =>
      // Calls the adapter which either returns SuccessResponse or throws ErrorResponse
      execute(login, data) as Promise<SuccessResponse<LoginData>>,

    onSuccess: () => {
      // Redirect on successful login
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
  });

  // Extract success and error messages from the mutation state
  const successMessage = mutation.data?.message?.key;
  const errorMessage = mutation.error?.message?.key;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginInput) => {
    mutation.mutate(values);
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
                <Input {...field} type="email" disabled={mutation.isPending} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Display success/error messages */}
        <FormError message={errorMessage} />
        <FormSuccess message={successMessage} />

        <LoadingButton type="submit" loading={mutation.isPending}>
          Login
        </LoadingButton>
      </form>
    </Form>
  );
}
```

### execute adapter implementation:

File: src/hooks/use-action.tsx

```typescript
import {
  isError,
  PartialResponse,
  Response,
  SuccessResponse,
} from '@/lib/response';

/**
 * Execute adapter for TanStack Query
 * Converts Response<T> pattern to TanStack Query's throw-on-error pattern
 *
 * @param action - Server action that returns Response<T>
 * @param args - Arguments to pass to the action
 * @returns SuccessResponse or PartialResponse on success
 * @throws ErrorResponse on error (for TanStack Query error handling)
 */
export async function execute<TData, TArgs>(
  action: (args: TArgs) => Promise<Response<TData>>,
  args: TArgs
): Promise<SuccessResponse<TData> | PartialResponse<TData>> {
  const result = await action(args);

  if (isError(result)) {
    throw result;
  }

  return result;
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

## 9. Batch Operations (Partial Responses)

### ✅ CORRECT: Using partial status

// File: src/features/bookmarks/actions/delete-many.ts

```typescript
'use server';

import { AppError } from '@/lib/errors/app-error';
import { type PartialError, type Response, response } from '@/lib/response';

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
          message: error.errorMessage,
          details: { id },
        });
      }
    }
  }

  // All succeeded
  if (errors.length === 0) {
    return response.success({ data: { deletedIds } });
  }

  // All failed
  if (deletedIds.length === 0) {
    return response.error(errors[0]); // Return first error as AppError
  }

  // Partial success
  return response.partial({ data: { deletedIds }, errors });
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
8. **Return `response.error()` in services** for domain errors
9. **Use i18n keys with params** for error messages (always use `{ key, params }` format)
10. **Use `partial` status** for batch operations with mixed results
11. **Log unexpected errors** before returning `INTERNAL_SERVER_ERROR`
12. **Use TanStack Query** with `execute` adapter for client-side mutations
13. **Use object-based options** for response factory functions (`success({ data, message })`)

### NEVER DO ❌

1. **Don't throw generic `Error`** from server actions
2. **Don't use magic numbers** for HTTP status codes
3. **Don't use string literals** for status without enum
4. **Don't return boolean** `success` flags
5. **Don't modify base error definitions** for new features
6. **Don't return `null` or `undefined`** to indicate errors
7. **Don't expose sensitive data** in error details
8. **Don't use `try/catch` on client** to handle server action errors (use TanStack Query)
9. **Don't use `alert()`** or generic error messages
10. **Don't skip input validation**
11. **Don't mix error handling patterns** across features
12. **Don't use positional parameters** in AppError constructor or response helpers
13. **Don't use plain strings for messages** (always use `{ key, params }` format)
14. **Don't use `Idle` or `Pending` status types** (removed in current implementation)

---

## 11. File Structure

```
src/
├── lib/
│   ├── http-status.ts          # HTTP status constants
│   ├── result.ts               # Response types, Status enum & helpers
│   └── errors/
│       ├── app-error.ts        # AppError class
│       ├── codes.ts            # Base error codes (ERROR_CODES)
│       ├── messages.ts         # Base error messages (ERROR_MESSAGES)
│       ├── helpers.ts          # Base error factory functions
│       └── index.ts            # Exports all errors
│
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   │   ├── login-user.ts   # Server action
│   │   │   └── register-user.ts
│   │   ├── services/
│   │   │   ├── login-user.ts   # Business logic
│   │   │   └── register-user.ts
│   │   ├── data/
│   │   │   ├── user.ts         # Data access layer (returns null on errors)
│   │   │   └── verification-token.ts
│   │   ├── schemas/
│   │   │   ├── login.ts        # Zod schemas
│   │   │   └── register.ts
│   │   ├── lib/
│   │   │   ├── errors.ts       # Auth-specific error factories
│   │   │   ├── codes.ts        # Auth error codes
│   │   │   └── messages.ts     # Auth error messages
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── posts/
│   │   ├── lib/
│   │   │   └── errors.ts       # Post-specific errors
│   │   └── ...
│   │
│   └── bookmarks/
│       ├── lib/
│       │   └── errors.ts       # Bookmark-specific errors
│       └── ...
│
├── hooks/
│   └── use-action.tsx          # execute adapter for TanStack Query
```

````

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
````

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
✅ **Modern Async Handling**: Seamless integration with TanStack Query

Follow these guidelines for all new features and refactor existing code to match this pattern.
