# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✅ Completed Tasks

#### Email Verification Check in Password Reset

**Completed:** November 13, 2025

**Issue:**

- `src/features/auth/services/reset-password.ts:40` - "TODO: Implement check for email verified status if applicable before proceeding"

**Description:**
Currently, the password reset flow does not verify if the user's email is verified before sending the reset email. This could be a security consideration depending on the application's requirements.

**Decision Made:**
Changed approach to return specific errors for better UX:

- **User not found**: Returns "User not found" error (reveals non-existence)
- **User exists but unverified**: Returns "Email verification required before password reset" error
- **User exists and verified**: Sends password reset email and returns success

This prioritizes user experience over full anti-enumeration protection. Users now get clear feedback about what they need to do.

**Testing:**

- ✅ Created comprehensive test suite in `src/features/auth/__tests__/reset-password-service.test.ts`
- ✅ Tests cover all scenarios: user not found, unverified user, verified user, feature flag disabled, error handling
- ✅ All tests pass (6/6) with proper mocking and assertions

#### Fix naming conventions in routes.ts

**Completed:** November 2025

- Changed `PUBLIC_ROUTES` → `publicRoutes`
- Changed `AUTH_ROUTES` → `authRoutes`
- Updated all imports and usages in `middleware.ts`
- **Status:** Completed

#### Remove unnecessary JSDoc @example comments

**Completed:** November 2025

- Cleaned up 5 auth service files
- Cleaned up 5 auth action files
- Removed redundant examples per guidelines: "avoid @example comments unless absolutely necessary"
- **Status:** Completed

#### Consolidate instruction file redundancies

**Completed:** November 2025

- Removed duplicate CORE_CODES and CORE_ERRORS definitions from `messages-and-codes.instructions.md`
- Added cross-references between instruction files
- **Status:** Completed

#### Social Provider Login UX Improvements

**Completed:** November 2025

- Added provider-specific loading state tracking
- Disabled all buttons during OAuth flow
- Show spinner only for active provider
- Prevents double-clicks during authentication
- **Status:** Completed

#### Add Email Parameter to Verification URLs for Better Query Performance

**Completed:** November 13, 2025

**Description:**
Added email parameter to verification URLs to leverage the composite unique index `[email, token]` for better database query performance and enhanced security.

**Changes Made:**

- **Mail URLs Updated:**
  - Email verification: `?type=email&token=${token}&email=${encodeURIComponent(email)}`
  - Password reset: `?token=${token}&email=${encodeURIComponent(email)}`

- **New Data Functions:**
  - `getVerificationTokenByEmailAndToken()` in `email-verification-token.ts`
  - `getPasswordResetTokenByEmailAndToken()` in `reset-token.ts`
  - Both use composite index `[email, token]` for efficient queries

- **Service Layer Updates:**
  - `verifyEmail()` service now accepts `(email, token)` parameters
  - `updatePassword()` service now accepts `(email, token)` parameters
  - Both use new email+token query functions

- **Action Layer Updates:**
  - `verifyEmail` action validates and passes both email and token
  - `updatePassword` action validates and passes both email and token

- **Schema Updates:**
  - `verifyEmailSchema` now includes email validation
  - `newPasswordSchema` now includes email validation

- **Component Updates:**
  - `EmailVerificationForm` extracts and validates both email and token from URL
  - `NewPasswordForm` extracts and validates both email and token from URL

- **Comprehensive Testing:**
  - Added tests for `getVerificationTokenByEmailAndToken()` (6 test cases)
  - Added tests for `getPasswordResetTokenByEmailAndToken()` (6 test cases)
  - All existing tests pass (244 tests total)

**Benefits:**

- ✅ **Better Performance:** Uses composite index instead of token-only lookups
- ✅ **Enhanced Security:** Validates token belongs to expected email
- ✅ **Improved UX:** Prevents accidental token reuse across emails
- ✅ **Future-Proof:** Email-based token management ready

**Database Impact:**
No schema changes needed - composite unique constraint `@@unique([email, token])` already exists.

**Status:** Completed

#### Environment Validation with Zod (build-time)

**Completed:** November 2025

**Issue:**
Environment variables caused brittle behavior when missing or malformed. Runtime validation led to client-bundle issues and poor developer experience.

**Description:**
Moved environment validation to a centralized, build-time flow and made the Zod schema lazy-loaded so it doesn't enter browser bundles. This keeps type safety while avoiding runtime validation in client code.

**Changes Made:**

- **Centralized schema (`src/lib/env.ts`):**
  - `getEnvValidationSchema()` exports a Zod schema factory (lazy `import('zod')`).
  - Keeps `env` typed as `process.env` with `EnvSchema` and an export of `envHelpers` for runtime feature checks.

- **Build-time validator (`scripts/validate-env.ts`):**
  - Node CLI that runs validation using the shared schema. Exported `validateEnv()` for unit tests.
  - Added script `npm run validate:env` and hooked it into the `build` step so CI fails early on misconfiguration.

- **Tests:**
  - `scripts/__tests__/validate-env.test.ts` tests the validator with good/bad env cases.
  - `src/lib/__tests__/env.test.ts` now focuses on `envHelpers` (client-safe checks).

- **Client safety:**
  - Avoids importing `zod` into client bundles and replaces a handful of client imports of `env` with `process.env` for compatibility (e.g., `tailwind-indicator.tsx`).

**Benefits:**

- ✅ **Build-time Safety:** Environment validation runs during build/CI — catches misconfig at build time.
- ✅ **No client-bundling issues:** `zod` is loaded lazily so it isn't bundled into client artifacts.
- ✅ **Centralized schema:** Single source of truth for env definitions and validation.
- ✅ **Testable:** `validateEnv()` is unit-tested for success/failure cases.

**Status:** Completed
