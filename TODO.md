# TODO List

## Future Tasks

### 🔢 Formatting Utilities Components

**Priority:** Medium  
**Status:** Not Started

Implement reusable formatting utility components inspired by [Web Awesome](https://webawesome.com/docs/components/) to format numbers and time values with locale support and flexible options.

#### Component 1: Format Number (`<FormatNumber>`)

**Description:** A React component that formats numbers using the browser's `Intl.NumberFormat` API with support for different locales and formatting styles.

**Features:**

- **Decimal formatting:** Format regular numbers with thousand separators (e.g., `1,000` or `1.000` based on locale)
- **Percentage formatting:** Display values as percentages (e.g., `0%`, `25%`, `50%`, `100%`)
- **Currency formatting:** Format monetary values with currency symbols or codes (e.g., `$2,000.00`, `€2.000,00`, `₽2 000,00`)
- **Locale support:** Use the `locale` prop to set number formatting locale (e.g., `en-US`, `de-DE`, `ru-RU`)
- **Customizable display:** Control currency display with `currencyDisplay` prop (`'symbol'`, `'narrowSymbol'`, `'code'`, or `'name'`)

**Props:**

```typescript
interface FormatNumberProps {
  value: number;
  type?: 'decimal' | 'percent' | 'currency'; // default: 'decimal'
  currency?: string; // ISO 4217 code (e.g., 'USD', 'EUR', 'GBP'), default: 'USD'
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'; // default: 'symbol'
  locale?: string; // BCP 47 language tag (e.g., 'en-US', 'de-DE'), default: browser locale
  withoutGrouping?: boolean; // disable thousand separators, default: false
  minimumIntegerDigits?: number; // min integer digits (1-21)
  minimumFractionDigits?: number; // min fraction digits (0-100)
  maximumFractionDigits?: number; // max fraction digits (0-100)
  minimumSignificantDigits?: number; // min significant digits (1-21)
  maximumSignificantDigits?: number; // max significant digits (1-21)
}
```

**Examples:**

```tsx
// Decimal (default)
<FormatNumber value={321412523} />
// Output: "321,412,523" (or locale-specific format)

// Percentage
<FormatNumber type="percent" value={0} />    {/* 0% */}
<FormatNumber type="percent" value={0.25} />  {/* 25% */}
<FormatNumber type="percent" value={0.5} />   {/* 50% */}
<FormatNumber type="percent" value={1} />     {/* 100% */}

// Currency
<FormatNumber type="currency" value={2000} currency="USD" locale="en-US" />
// Output: "$2,000.00"

<FormatNumber type="currency" value={2000} currency="EUR" locale="de-DE" />
// Output: "2.000,00 €"

<FormatNumber type="currency" value={2000} currency="RUB" locale="ru-RU" />
// Output: "2 000,00 ₽"
```

**Implementation Details:**

- Create component at `src/components/format-number.tsx` (or `src/components/ui/format-number.tsx`)
- Use `Intl.NumberFormat` API for native locale support (no language packs needed)
- Use `useLocale()` hook or context to get default locale from app
- Handle edge cases: `null`, `undefined`, `NaN`, `Infinity`
- Support dynamic locale changes
- Render as `<span>` with formatted text content
- Add TypeScript types for all props

**Testing:**

- Test basic decimal formatting with different locales
- Test percentage conversion (0.25 → 25%)
- Test currency formatting with different ISO 4217 codes
- Test edge cases (NaN, Infinity, null values)
- Test locale fallback behavior
- Test grouping separator disabling
- Test significant digits vs. fraction digits

**Affected Files:**

- `src/components/format-number.tsx` (new component)
- `src/components/ui/index.ts` (export if using ui folder)
- `src/components/__tests__/format-number.test.tsx` (new test)

---

#### Component 2: Relative Time (`<RelativeTime>`)

**Description:** A React component that outputs a localized time phrase relative to the current date and time (e.g., "5 minutes ago", "in 2 days").

**Features:**

- **Relative time display:** Show human-readable relative time (e.g., "5 minutes ago", "yesterday", "in 2 weeks")
- **Formatting styles:** Three levels of verbosity - `'narrow'` (e.g., "5y ago"), `'short'` (e.g., "5 yr. ago"), `'long'` (e.g., "5 years ago")
- **Numeric behavior:** Control whether to always show numeric values or allow "auto" descriptive text (e.g., "yesterday" vs. "1 day ago")
- **Automatic sync:** Optional `sync` prop to update display as time passes
- **Locale support:** Use `locale` prop to set the desired locale for formatting
- **Custom date:** `date` prop accepts ISO 8601 strings or Date objects

**Props:**

```typescript
interface RelativeTimeProps {
  date: Date | string; // ISO 8601 string or Date object
  format?: 'long' | 'short' | 'narrow'; // default: 'long'
  numeric?: 'always' | 'auto'; // default: 'auto'
  sync?: boolean; // auto-update as time passes, default: false
  locale?: string; // BCP 47 language tag (e.g., 'en-US', 'hu-HU'), default: browser locale
}
```

**Examples:**

```tsx
// Basic usage (format: long, numeric: auto)
<RelativeTime date="2025-10-31T10:00:00Z" />
// Output: "5 days ago" or "yesterday" (depending on current time)

// Short format
<RelativeTime
  date="2025-11-02T14:30:00Z"
  format="short"
/>
// Output: "5 yr. ago" or "5 yr. from now"

// Narrow format
<RelativeTime
  date="2025-11-02T14:30:00Z"
  format="narrow"
/>
// Output: "5y ago"

// Always numeric (no descriptive text)
<RelativeTime
  date="2025-11-01T00:00:00Z"
  numeric="always"
/>
// Output: "1 day ago" (instead of "yesterday")

// With auto-sync (updates as time passes)
<RelativeTime
  date={new Date()}
  sync={true}
/>
// Output: "now" → "1 second ago" → "2 seconds ago" (auto-updates)

// Hungarian locale
<RelativeTime
  date="2025-11-02T10:00:00Z"
  locale="hu-HU"
/>
// Output: "5 napja"
```

**Implementation Details:**

- Create component at `src/components/relative-time.tsx` (or `src/components/ui/relative-time.tsx`)
- Use `Intl.RelativeTimeFormat` API for native locale support
- Automatically calculate time unit (seconds, minutes, hours, days, months, years) based on difference
- Use `useInterval` hook to implement sync feature (updates every 1 second)
- Parse ISO 8601 strings safely with `Date.parse()` or date library
- Handle edge cases: past/future dates, very large/small differences
- Support dynamic locale changes
- Render as `<time>` element with `dateTime` attribute for accessibility
- Add TypeScript types for all props

**Hook Implementation (if needed):**

```typescript
function useRelativeTime(date: Date | string, sync?: boolean) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  const update = () => {
    // Calculate and format relative time
    setRelativeTime(/* formatted string */);
  };

  useEffect(() => {
    update();
    if (!sync) return;

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date, sync]);

  return relativeTime;
}
```

**Testing:**

- Test past dates (5 minutes ago, 2 hours ago, 3 days ago, 6 months ago)
- Test future dates (in 5 minutes, in 2 hours, tomorrow)
- Test different formatting styles (long, short, narrow)
- Test numeric vs. auto behavior
- Test sync updates at intervals
- Test different locales (en-US, hu-HU, de-DE, ru-RU)
- Test edge cases (current time, very far past/future dates)
- Test ISO 8601 string parsing
- Test accessibility (time element with dateTime attribute)

**Affected Files:**

- `src/components/relative-time.tsx` (new component)
- `src/hooks/use-relative-time.ts` (new hook, optional)
- `src/components/ui/index.ts` (export if using ui folder)
- `src/components/__tests__/relative-time.test.tsx` (new test)

---

**Implementation Steps:**

1. **Phase 1: FormatNumber Component**
   - [ ] Create `src/components/format-number.tsx` with full prop support
   - [ ] Add TypeScript types and JSDoc documentation
   - [ ] Implement `Intl.NumberFormat` wrapper with error handling
   - [ ] Create comprehensive test suite
   - [ ] Add usage examples in component JSDoc

2. **Phase 2: RelativeTime Component**
   - [ ] Create `src/components/relative-time.tsx` with full prop support
   - [ ] Optionally create `src/hooks/use-relative-time.ts` helper hook
   - [ ] Implement `Intl.RelativeTimeFormat` wrapper with time unit calculation
   - [ ] Implement sync feature with `useInterval` or `setInterval`
   - [ ] Add accessibility features (`<time>` element)
   - [ ] Create comprehensive test suite
   - [ ] Add usage examples in component JSDoc

3. **Phase 3: Integration & Documentation**
   - [ ] Export both components from `src/components/ui/index.ts` (if applicable)
   - [ ] Add usage documentation to component files
   - [ ] Create example/demo file in docs or Storybook (if applicable)
   - [ ] Add i18n key examples to `src/locales/*/common.json` if needed
   - [ ] Update project README with formatting utilities section

**Benefits:**

- ✅ Reusable formatting components across the application
- ✅ Built-in locale support using browser APIs (no language packs needed)
- ✅ Improved UX with human-readable time phrases
- ✅ Type-safe implementation with full TypeScript support
- ✅ Better performance with native browser formatting APIs
- ✅ Accessibility-first design (proper semantic HTML)
- ✅ Aligned with modern Web Awesome component design patterns

**Related Web Awesome Docs:**

- Format Number: https://webawesome.com/docs/components/format-number/
- Relative Time: https://webawesome.com/docs/components/relative-time/
- Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- Intl.RelativeTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat

---

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
- Ensure parameters work correctly on direct navigation- Ensure parameters work correctly on direct navigation

---

### ⚡ Component Performance Optimization

**Priority:** Medium  
**Status:** Not Started

**Description:**
Optimize React components for better performance, considering the upcoming React Compiler 1.0 in Next.js 16. While the compiler provides automatic memoization, manual optimization may still be needed for complex cases.

**Current Issues:**

- Components may be re-rendering unnecessarily due to new function/object creation on each render
- Larger computations in components could benefit from memoization
- No established patterns for performance optimization in the codebase
- React Compiler 1.0 (coming with Next.js 16) will provide automatic memoization, but manual control may still be needed

**Proposed Solution:**

With React Compiler 1.0:

- Rely on automatic memoization provided by the compiler for most cases
- Use `useMemo` and `useCallback` as escape hatches where precise control is needed (e.g., effect dependencies)
- For new code: prefer compiler-driven optimization over manual memoization
- For existing code: carefully test before removing manual memoization, as it may change compilation output

Manual optimization where still beneficial:

- Use `useMemo` for expensive computations that depend on props or state
- Use `useCallback` to memoize functions passed as props to prevent child component re-renders
- Identify components with heavy computations or frequent re-renders for optimization

**Implementation Steps:**

1. **Prepare for React Compiler adoption:**
   - Ensure Next.js 16 upgrade includes React Compiler configuration
   - Add `babel-plugin-react-compiler` or equivalent to build setup
   - Enable compiler-powered ESLint rules from `eslint-plugin-react-hooks`

2. **Audit existing components:**
   - Review current `useMemo`/`useCallback` usage - some may be removable with compiler
   - Identify performance bottlenecks that need manual optimization
   - Test component re-rendering patterns

3. **Update guidelines:**
   - Document React Compiler best practices
   - Update performance optimization patterns to prefer compiler-driven approaches
   - Include migration guidance for existing manual memoization

**Guidelines Update:**

Update `nextjs.instructions.md` or `typescript-5-es2022.instructions.md` to include:

- React Compiler adoption and configuration
- When to use manual `useMemo`/`useCallback` vs relying on compiler
- Performance optimization patterns for compiler-enabled apps

**Affected Files:**

- All React components in `src/components/` and `src/features/*/components/`
- `src/.github/instructions/nextjs.instructions.md` (add React Compiler guidelines)
- `src/.github/instructions/typescript-5-es2022.instructions.md` (add performance guidelines)
- Build configuration files (add React Compiler plugin)
- `eslint.config.js` (enable compiler-powered linting)

**Benefits:**

- ✅ Automatic performance improvements from React Compiler
- ✅ Reduced manual optimization burden
- ✅ Better adherence to React rules through compiler linting
- ✅ Future-proof performance optimization patterns
- ✅ Improved build performance with SWC support

**Timeline:**

- Start after Next.js 16 stable release
- Enable React Compiler incrementally following official adoption guide
- Test performance improvements and adjust manual optimizations as needed

### ⚡ Caching priority and static prerendering

**Priority:** High  
**Status:** Not Started

Goal: Make caching a first-class concern and prefer pages that can be statically prerendered using Next.js Cache Components (use cache / cacheLife / cacheTag / revalidateTag / updateTag) and React `Suspense` where appropriate.

Details and expectations:

- Follow the Next.js Cache Components guidance: https://nextjs.org/docs/app/getting-started/cache-components — pay attention to runtime APIs (cookies, headers, searchParams, connection, draftMode, etc.) that make a route dynamic.
- Where possible, make pages statically prerenderable by adding `use cache` and `cacheLife` at Page/Layout or helper function level.
- Use the Data Cache thoughtfully: avoid making an entire route dynamic because of an internal fetch — move fetch logic into cached helpers and tag cached data (`cacheTag`, `revalidateTag`, `updateTag`) to enable targeted invalidation and revalidation.
- Use `Suspense` boundaries for streaming + partial prerendering (PPR): render a fast static shell and stream dynamic parts in with fallback UI.
- Authentication (auth): because we want to keep pages prerenderable, perform user-specific checks (session validation) in middleware or (soon) a proxy layer. The middleware/proxy should handle auth verification and forward any necessary headers/identifiers to internal APIs.
- Documentation: later update project guidelines in `docs/` and `.github/instructions` with examples (when to use `use cache`, when to wrap with `Suspense`, and how to design middleware/proxy auth flows while preserving static shells).

Acceptance criteria:

1. This item exists in the repository `TODO.md` (this entry).
2. A follow-up task will run an audit over `src/app` and `src/features` routes to mark which pages/components can move to `use cache` and where `Suspense` boundaries are needed.
3. A separate TODO/plan exists for middleware -> proxy based auth verification and for updating `next.config.ts` to enable `cacheComponents: true` if the team approves.

Notes / assumptions:

- The repo uses the Next.js App Router (project structure indicates this).
- Enabling Cache Components requires a config change (`next.config.ts`). Only apply if the team accepts the runtime/behavioural changes.

Proxy considerations:

- Follow the Next.js Proxy guidance: https://nextjs.org/docs/app/getting-started/proxy
- Use cases: quick redirects, header modifications, A/B rewrites, and optimistic checks (permission-based redirects). Proxy is effective for running fast pre-request logic that can rewrite/redirect or modify headers.
- Limitations: Proxy is not intended for slow data fetching or full session management/authorization. Avoid heavy IO inside `proxy.ts`. Do not rely on Proxy for long-running auth flows.
- Convention: place a single `proxy.ts` (or `.js`) at the project root or `src/` and organize logic into modules imported by that file. Only one `proxy.ts` is supported per project; use `matcher` to scope proxy rules to paths.
- Behavior notes: fetch options like `options.cache`, `options.next.revalidate`, or `options.next.tags` have no effect inside Proxy. Proxy can rewrite, redirect, modify headers, or respond directly.
- How this relates to caching/auth: Proxy is a good place for optimistic auth checks or request-based rewrites before a route renders, and for header transformations that help downstream APIs; however, for robust session validation and auth flows prefer middleware (or a dedicated backend auth service). Use Proxy for lightweight checks and middleware/proxy together to preserve static shells while handling auth and header forwarding.

---

### 🔍 Add Email Parameter to Verification URLs for Better Query Performance

**Priority:** Medium  
**Status:** Not Started

**Description:**
Currently, verification URLs only include the token parameter (`?token=uuid`), and the database query searches solely by token. However, the `VerificationToken` model has a composite unique index on `[email, token]`, which could be leveraged for more efficient queries.

The token field is a UUID v4 string (unique), while the id is cuid(). Using email + token for queries would leverage the composite index more effectively than token-only searches.

**Proposed Solution:**
Add the email parameter to verification URLs in `mail.ts` and update the verification service to query by both email and token. This provides several benefits:

1. **Better Performance:** Uses the composite index `[email, token]` instead of just `token`
2. **Enhanced Security:** Validates that the token belongs to the expected email
3. **Improved UX:** Prevents accidental token reuse across different emails

**Current Implementation:**

```typescript
// mail.ts
const url = `${BASE_URL}${routes.auth.verifyEmail.url}?token=${token}`;

// verify-email.ts
const existingToken = await getVerificationTokenByToken(token);
```

**Proposed Changes:**

```typescript
// mail.ts
const url = `${BASE_URL}${routes.auth.verifyEmail.url}?token=${token}&email=${encodeURIComponent(email)}`;

// verify-email.ts - new query function needed
const existingToken = await getVerificationTokenByEmailAndToken(email, token);
```

**Implementation Steps:**

1. Update `sendVerificationEmail` in `mail.ts` to include email parameter
2. Update `sendResetPasswordEmail` in `mail.ts` to include email parameter (if applicable)
3. Create new data function `getVerificationTokenByEmailAndToken` in `src/features/auth/data/verification-token.ts`
4. Update `verifyEmail` service to accept email parameter and use new query
5. Update `verify-email` action to extract and validate email from URL params
6. Update password reset flow similarly if needed
7. Add tests for the new query and parameter handling

**Benefits:**

- ✅ Potentially faster queries using composite index
- ✅ Additional validation layer (token must match email)
- ✅ Better separation of concerns in URL parameters
- ✅ Future-proof for email-based token management

**Affected Files:**

- `src/features/auth/lib/mail.ts`
- `src/features/auth/data/verification-token.ts` (new function)
- `src/features/auth/services/verify-email.ts`
- `src/features/auth/actions/verify-email.ts`
- `src/features/auth/services/reset-password.ts` (if applicable)
- Test files for the above

**Database Impact:**
The composite unique constraint `@@unique([email, token])` already exists, so no schema changes needed. The new query will leverage this index effectively.

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
