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
