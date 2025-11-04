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

### 🔐 Stronger Password Requirements in Schema

**Priority:** Very Low
**Status:** Not Started

**Description:**
Update password validation schema to require stronger passwords with complexity requirements.

**Proposed Changes:**

- Update `src/features/auth/schemas/*.ts` password validation rules
- Add requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
- Update corresponding error messages in `src/features/auth/lib/strings.ts`
- Consider adding password strength indicator in UI components

**Why:**
Enhanced security through stronger password policies. Very low priority as current requirements are functional.

**Affected Files:**

- `src/features/auth/schemas/*.ts`
- `src/features/auth/lib/strings.ts`
- `src/features/auth/components/*password*.tsx` (optional)

---

### 🔧 Environment Validation with Zod

**Priority:** Medium  
**Status:** Not Started

**Description:**
Implement Zod-based environment variable validation to fail fast on missing or invalid configuration, preventing runtime errors from misconfigured environments.

**Current Issues:**

- No validation of required environment variables
- Runtime errors when DATABASE_URL or AUTH_SECRET is missing
- Test environment issues due to missing .env.test configuration
- No type safety for environment variables

**Proposed Solution:**

Create a centralized environment validation utility:

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  RESEND_API_KEY: z.string().optional(),
  // Add other env vars as needed
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export const env = validateEnv();
```

**Implementation Steps:**

1. Install `zod` dependency if not already present
2. Create `src/lib/env.ts` with the validation schema
3. Replace direct `process.env` usage throughout the codebase with `env` import
4. Create `.env.test` file with test environment variables
5. Update `vitest.config.ts` to load test environment:
   ```typescript
   // vitest.config.ts
   export default defineConfig({
     // ... existing config
     test: {
       env: loadEnv('test', process.cwd(), ''),
     },
   });
   ```
6. Update TypeScript types for better IntelliSense
7. Add validation tests

**Benefits:**

- ✅ Fail fast on startup with clear error messages
- ✅ Type-safe environment variables
- ✅ Centralized configuration management
- ✅ Better test environment handling
- ✅ Prevents runtime crashes from missing config

**Affected Files:**

- `src/lib/env.ts` (new file)
- `.env.test` (new file)
- `vitest.config.ts` (update)
- All files using `process.env.*` (replace with `env.*`)
- `package.json` (add zod if needed)

**Testing:**

- Test missing required variables (should throw)
- Test invalid values (should throw)
- Test valid configuration (should pass)
- Test optional variables
- Verify test environment loads correctly

### 🐛 OAuth and Verification URL Parameter Conflicts in Login Form

**Priority:** High  
**Status:** Not Started

**Issue:**

URL parameter conflicts in the login form when multiple authentication flows are attempted:

1. **OAuth Error Persistence:** When OAuth login fails (e.g., `OAuthAccountNotLinked`), the error remains in the URL (`?error=OAuthAccountNotLinked`). If the user then attempts regular email/password login with invalid credentials, the OAuth error takes precedence over the new login error, causing confusion.

2. **Verification Parameter Mixing:** The email verification form (`verification-form.tsx`) redirects with success (`?verified=1`) or error parameters (`?verify_error=...`). These can mix with OAuth errors or regular login errors, showing incorrect messages.

**Current Behavior:**

- `errorMessage` in `useLoginForm` hook uses fallback logic: `mutation.error?.message?.key || urlError || verifyErrorMessage`
- OAuth errors persist in URL even after successful regular login attempts with different errors
- No URL cleanup on form submission

**Proposed Solution (Updated):**

Instead of cleaning URL on submit, implement a **consume-once pattern** with immediate URL cleanup:

```typescript
// Create a general hook for URL parameter consumption
const useUrlParams = (paramNames: string[]) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract and store parameter values
  const params = useMemo(() => {
    const result: Record<string, string | null> = {};
    paramNames.forEach(name => {
      result[name] = searchParams.get(name);
    });
    return result;
  }, [searchParams, paramNames]);

  // Clean URL immediately after extraction
  useEffect(() => {
    const hasParams = paramNames.some(name => searchParams.has(name));
    if (hasParams) {
      const newSearchParams = new URLSearchParams(searchParams);
      paramNames.forEach(name => newSearchParams.delete(name));
      const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchParams, paramNames]);

  return params;
};

// Usage in useLoginForm:
const urlParams = useUrlParams(['error', 'verified', 'verify_error']);
const urlError =
  urlParams.error === 'OAuthAccountNotLinked' ? AUTH_ERRORS.oauthNotLinked : '';
const isVerifySuccess = urlParams.verified === '1';
// ... rest of logic
```

**Benefits:**

- ✅ URL immediately clean after parameter consumption
- ✅ No parameter persistence across submissions
- ✅ Reusable hook for other components
- ✅ Better UX (no stale parameters)
- ✅ Handles refresh correctly (parameters disappear)

**Alternative Solution (Simpler):**

Keep current logic but clean URL on submit:

```typescript
const onSubmit = (values: LoginInput) => {
  if (mutation.isPending) return;

  // Clean auth-related parameters
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.delete('error');
  newSearchParams.delete('verified');
  newSearchParams.delete('verify_error');

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?${newSearchParams.toString()}`
  );

  mutation.mutate(values);
};
```

**Decision:** The consume-once pattern is better for long-term maintainability and prevents similar issues elsewhere.

**Affected Files:**

- `src/features/auth/components/login-form.tsx` (main fix)
- `src/hooks/use-url-params.ts` (new reusable hook)

**Testing:**

- Test OAuth error → regular login error sequence (URL should be clean)
- Test verification success/error → regular login flow
- Test page refresh after parameter consumption (should be clean)
- Ensure parameters work correctly on direct navigation## Completed Tasks ✅

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
