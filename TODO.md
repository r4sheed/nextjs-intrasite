# TODO List

## Future Tasks

### ⚠️ Centralized Logging System

**Priority:** Medium  
**Status:** Not Started

Implement a centralized logging service to replace scattered `console.log` and `console.error` calls throughout the codebase.

**Current Issues:**

- Multiple TODO comments referencing the need for centralized logging:
  - `src/features/auth/services/update-password.ts:90` - "TODO: Log the error properly using a centralized logger"
  - `src/features/auth/services/reset-password.ts:65` - "TODO: Log the error properly using a centralized logger"
  - `src/features/auth/services/login-user.ts:112` - "TODO: Log the error for debugging"
- Direct `console.log` usage (currently only in JSDoc examples - cleaned up)

**Proposed Solution:**

Create a centralized logger utility at `src/lib/logger.ts`:

```typescript
// src/lib/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context || '');
    }
    // Production: send to monitoring service (e.g., Sentry, LogRocket, DataDog)
  },

  warn: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // Production: send to monitoring service
  },

  error: (message: string, error?: unknown, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, { error, ...context });
    }
    // Production: send to error tracking service (e.g., Sentry)
  },

  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  },
};
```

**Implementation Steps:**

1. Create `src/lib/logger.ts` with the logger utility
2. Replace TODO comments with `logger.error()` calls in:
   - `src/features/auth/services/update-password.ts`
   - `src/features/auth/services/reset-password.ts`
   - `src/features/auth/services/login-user.ts`
3. Consider integrating with a production monitoring service (Sentry, LogRocket, etc.)
4. Update error handling guidelines to mandate logger usage

**Affected Files:**

- `src/features/auth/services/update-password.ts`
- `src/features/auth/services/reset-password.ts`
- `src/features/auth/services/login-user.ts`

---

### �📝 Email Verification Check in Password Reset

**Priority:** Low  
**Status:** Not Started

**Issue:**

- `src/features/auth/services/reset-password.ts:40` - "TODO: Implement check for email verified status if applicable before proceeding"

**Description:**
Currently, the password reset flow does not verify if the user's email is verified before sending the reset email. This could be a security consideration depending on the application's requirements.

**Proposed Solution:**
Add an optional check to ensure the user's email is verified before allowing password reset:

```typescript
// In resetPassword service
if (siteFeatures.emailVerification && user && !user.emailVerified) {
  // Either:
  // 1. Return generic success (anti-enumeration)
  // 2. Send verification email instead
  // 3. Return specific error (reveals email exists)
}
```

**Decision Required:**

- Should unverified users be able to reset their password?
- What message should be shown to maintain anti-enumeration protection?

---

## Completed Tasks ✅

### ✅ Fix naming conventions in routes.ts

- Changed `PUBLIC_ROUTES` → `publicRoutes`
- Changed `AUTH_ROUTES` → `authRoutes`
- Updated all imports and usages in `middleware.ts`
- **Status:** Completed

### ✅ Remove unnecessary JSDoc @example comments

- Cleaned up 5 auth service files
- Cleaned up 5 auth action files
- Removed redundant examples per guidelines: "avoid @example comments unless absolutely necessary"
- **Status:** Completed

### ✅ Consolidate instruction file redundancies

- Removed duplicate CORE_CODES and CORE_ERRORS definitions from `messages-and-codes.instructions.md`
- Added cross-references between instruction files
- **Status:** Completed

### ✅ Social Provider Login UX Improvements

- Added provider-specific loading state tracking
- Disabled all buttons during OAuth flow
- Show spinner only for active provider
- Prevents double-clicks during authentication
- **Status:** Completed
