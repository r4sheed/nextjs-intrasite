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

### Social Provider Login UX Improvements

**Priority:** Medium  
**Status:** Not Started

**Issue:**

- `src/features/auth/components/social-providers.tsx` - No loading state feedback during OAuth flow

**Description:**
Currently, when a user clicks a social provider button (Google/GitHub), there's no visual feedback indicating that the authentication process has started. Users might click multiple times or be uncertain if their action registered.

**Proposed Solution:**

1. Add loading state tracking for each provider separately
2. Disable all provider buttons when any provider authentication is in progress
3. Show spinner icon in place of the provider icon only for the active provider
4. Keep other provider icons visible but disabled

**Implementation:**

```typescript
// State to track which provider is currently loading
const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);

const onClick = async (provider: AuthProvider) => {
  if (disabled || loadingProvider) return;
  setLoadingProvider(provider);
  await signIn(provider, {
    redirectTo: DEFAULT_LOGIN_REDIRECT,
  });
};

// Button example:
<Button
  disabled={disabled || loadingProvider !== null}
  onClick={() => onClick(AuthProvider.Google)}
>
  {loadingProvider === AuthProvider.Google ? (
    <Spinner className="size-5" />
  ) : (
    <SocialIcons.google className="size-5" />
  )}
</Button>
```

**Benefits:**

- Clear visual feedback for user actions
- Prevents accidental double-clicks
- Better UX during OAuth redirect flow
- Professional, polished authentication experience

**Affected Files:**

- `src/features/auth/components/social-providers.tsx`

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
