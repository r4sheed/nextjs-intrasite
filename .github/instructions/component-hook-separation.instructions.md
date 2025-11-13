---
description: 'Guidelines for Component Hook Separation and Code Transparency'
applyTo: 'src/features/**/components/**/*.tsx'
---

# Component Hook Separation Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** React Components with Complex Hooks

---

## Overview

This document establishes guidelines for separating complex component hooks into smaller, focused hooks to improve code readability, testability, and maintainability. These patterns were developed during the auth component refactoring and should be applied to future complex components.

---

## Core Principles

1. **Single Responsibility**: Each hook should have one clear purpose
2. **Transparency**: Hook logic should be easily understandable at a glance
3. **Testability**: Separated hooks are easier to unit test
4. **Reusability**: Focused hooks can be reused across components
5. **Documentation**: All hooks must have comprehensive JSDoc comments

---

## When to Separate Hooks

### ✅ SEPARATE when component has:

- **Multiple data sources** (URL params, API calls, form state)
- **Complex state logic** (multiple useState calls with interdependencies)
- **Side effects** (useEffect with multiple dependencies)
- **Business logic** (validation, transformation, routing)
- **Event handlers** (multiple onClick, onSubmit, etc.)

### ❌ DON'T SEPARATE when:

- **Simple state** (single useState for basic UI state)
- **Single API call** (one mutation with simple success/error handling)
- **Pure presentation** (components that only render props)
- **Template components** (email templates, static UI)

---

## Separation Patterns

### Pattern 1: Data Source Hooks

Separate hooks that handle different data sources:

```typescript
// ✅ GOOD: Separated data source hooks
const useUrlParams = () => {
  /* URL parameter logic */
};
const useApiMutation = () => {
  /* API call logic */
};
const useFormState = () => {
  /* Form state logic */
};

// ❌ BAD: Monolithic hook mixing concerns
const useComplexForm = () => {
  // URL params + API + form state all mixed together
};
```

### Pattern 2: State Management Hooks

Separate state that serves different purposes:

```typescript
// ✅ GOOD: Focused state hooks
const useFormValidation = () => {
  /* Validation state */
};
const useSubmissionState = () => {
  /* Loading/success/error */
};
const useFieldState = () => {
  /* Individual field values */
};

// ❌ BAD: Generic "state" hook
const useEverythingState = () => {
  const [validation, setValidation] = useState();
  const [loading, setLoading] = useState();
  const [fields, setFields] = useState();
};
```

### Pattern 3: Effect Hooks

Separate effects by their purpose:

```typescript
// ✅ GOOD: Focused effect hooks
const useAutoSubmit = () => {
  /* Auto-submit logic */
};
const useFieldSync = () => {
  /* Field synchronization */
};

// ❌ BAD: Multiple effects in one hook
const useEffects = () => {
  useEffect(/* auto-submit */);
  useEffect(/* field sync */);
  useEffect(/* validation */);
};
```

---

## Hook Naming Conventions

### ✅ CORRECT: Descriptive names with "use" prefix

```typescript
// Data source hooks
const useUrlParams = () => {};
const useSearchParams = () => {};
const useApiData = () => {};

// State hooks
const useFormState = () => {};
const useValidationState = () => {};
const useSubmissionState = () => {};

// Effect hooks
const useAutoSubmit = () => {};
const useFieldFocus = () => {};
const useKeyboardShortcuts = () => {};

// Mutation hooks
const useLoginMutation = () => {};
const useSignupMutation = () => {};
const usePasswordResetMutation = () => {};
```

### ❌ WRONG: Generic or unclear names

```typescript
const useData = () => {}; // Too generic
const useStuff = () => {}; // Unclear
const useHook = () => {}; // Redundant
const useComplexLogic = () => {}; // Not descriptive
```

---

## JSDoc Documentation Requirements

### ✅ REQUIRED: Comprehensive JSDoc for all hooks

````typescript
/**
 * Manages URL parameters for login form
 * Handles OAuth error codes and 2FA redirect flags from URL search params
 *
 * @returns Object containing parsed URL parameters and utility functions
 * @property {string | null} error - OAuth error code from URL
 * @property {boolean} showTwoFactor - Whether to show 2FA form
 * @property {() => void} clearError - Function to clear error state
 *
 * @example
 * ```tsx
 * const { error, showTwoFactor, clearError } = useUrlParams();
 *
 * if (error) {
 *   return <ErrorMessage error={error} onClear={clearError} />;
 * }
 * ```
 */
const useUrlParams = () => {
  // Implementation
};
````

### Documentation Elements

- **Description**: Clear explanation of what the hook does
- **Returns**: Description of return object structure
- **Properties**: Document each property in the return object
- **Example**: Practical usage example
- **Dependencies**: Note any external dependencies or side effects

---

## Component Structure After Separation

### ✅ CORRECT: Clean component using separated hooks

```tsx
'use client';

import { useUrlParams } from './hooks/use-url-params';
import { useLoginMutation } from './hooks/use-login-mutation';
import { useFormState } from './hooks/use-form-state';
import { useLoginForm } from './hooks/use-login-form';

export function LoginForm() {
  const urlParams = useUrlParams();
  const mutation = useLoginMutation();
  const formState = useFormState();
  const form = useLoginForm({
    urlParams,
    mutation,
    formState,
  });

  // Simple render logic
  return <Form {...form}>{/* Form fields */}</Form>;
}
```

### ❌ WRONG: Monolithic component

```tsx
'use client';

export function LoginForm() {
  // 50+ lines of mixed hook logic
  const searchParams = useSearchParams();
  const [error, setError] = useState();
  const mutation = useMutation();
  // ... more mixed logic

  return (
    // Complex render with embedded logic
  );
}
```

---

## Testing Separated Hooks

### ✅ CORRECT: Easy to test individual hooks

```typescript
// useUrlParams.test.ts
describe('useUrlParams', () => {
  it('parses error from URL', () => {
    // Test URL parsing logic
  });

  it('clears error state', () => {
    // Test state clearing
  });
});

// useLoginMutation.test.ts
describe('useLoginMutation', () => {
  it('calls login action on success', () => {
    // Test mutation logic
  });

  it('handles errors properly', () => {
    // Test error handling
  });
});
```

### ❌ WRONG: Hard to test monolithic hooks

```typescript
// ComplexForm.test.ts - hard to isolate individual behaviors
describe('ComplexForm', () => {
  it('does everything at once', () => {
    // Complex test with many assertions
  });
});
```

---

## Migration Checklist

When refactoring existing components:

- [ ] Identify complex hooks with multiple responsibilities
- [ ] Break down into focused hooks following naming conventions
- [ ] Add comprehensive JSDoc documentation to each hook
- [ ] Create barrel exports for clean imports
- [ ] Update component to use separated hooks
- [ ] Add unit tests for each separated hook
- [ ] Verify all existing functionality still works
- [ ] Update any component documentation

---

## Examples from Auth Refactoring

### Login Form Separation

**Before:** One complex hook handling URL params, API calls, and form state

**After:** Four focused hooks:

- `useUrlParams` - URL parameter parsing
- `useLoginMutation` - API mutation logic
- `useFormState` - Form validation state
- `useLoginForm` - Form integration and event handlers

### Two-Factor Form Separation

**Before:** Monolithic hook with URL parsing, mutations, auto-submit, and state

**After:** Five focused hooks:

- `useTwoFactorUrlParams` - URL parameter handling
- `useTwoFactorMutations` - API calls for verification and resend
- `useTwoFactorAutoSubmit` - Auto-submit logic
- `useTwoFactorState` - Form and UI state
- `useTwoFactorForm` - Form integration

---

## Benefits Achieved

- **Improved Readability**: Each hook has a single, clear purpose
- **Better Testability**: Individual hooks can be tested in isolation
- **Enhanced Reusability**: Hooks can be reused across components
- **Easier Maintenance**: Changes to one concern don't affect others
- **Clearer Documentation**: JSDoc makes API usage obvious
- **Reduced Complexity**: Components focus on rendering, hooks handle logic

---

## Future Application

Apply these guidelines to any new complex component that:

1. Has more than 3 different concerns (data, state, effects)
2. Contains business logic mixed with presentation
3. Would benefit from isolated testing
4. Could reuse hook logic across multiple components

Remember: Simple components don't need this level of separation. Use judgment to apply these patterns where they provide clear value.
