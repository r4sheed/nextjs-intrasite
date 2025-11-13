---
description: 'Guidelines for testing Next.js + TypeScript applications'
applyTo: '**/__tests__/**, **/*.test.ts, **/*.test.tsx'
---

# Testing Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** Next.js, React, Vitest, React Testing Library

---

## Overview

This document establishes the standards and best practices for testing across the application. The goal is to ensure code is reliable, maintainable, and bug-free.

---

## Core Principles

1.  **Test Behavior, Not Implementation**: Tests should verify what the user can do, not how the code is structured internally.
2.  **Co-locate Tests**: Test files should be placed in a `__tests__` directory alongside the feature or component they are testing.
3.  **Aim for High Coverage**: While 100% coverage is not always practical, all critical paths and business logic must be tested.
4.  **Use the Right Type of Test**:
    - **Unit Tests**: For individual functions, hooks, or simple components in isolation.
    - **Integration Tests**: For components that interact with each other or with hooks/context.
    - **End-to-End (E2E) Tests**: For critical user flows through the entire application stack (using tools like Playwright or Cypress).

---

## Unit & Integration Testing

### Component Testing

- **Write unit tests** for components with React Testing Library.
- **Test user interactions** and component behavior (e.g., clicks, form submissions).
- **Mock external dependencies** and API calls to isolate the component.
- **Use test utilities** like `render`, `fireEvent`, and `waitFor` from React Testing Library.

### Testing Best Practices

- **Test for accessibility** using tools like `jest-axe`.
- **Test all states**: loading, error, success, and empty states.
- **Use descriptive test names** that clearly state what is being tested (e.g., `it('should display an error message when login fails')`).
- **Keep tests maintainable** and refactor them as the code evolves.
- **Clean up mocks** after each test to ensure test isolation (`vi.clearAllMocks()` or `jest.clearAllMocks()`).

---

## Mocking

- **Use Vitest's `vi.mock`** to mock modules and dependencies.
- **Provide mock implementations** for services and data-fetching functions.
- **Mock server responses** for API calls to simulate different scenarios (success, error, etc.).

---

## End-to-End (E2E) Testing

- **Identify critical user flows** (e.g., authentication, creating a post, checkout).
- **Write E2E tests** for these flows using a framework like Playwright or Cypress.
- **Run E2E tests** in a CI/CD pipeline to catch regressions before deployment.

---

## Running Tests

### All Tests

Run the complete test suite to ensure all functionality works correctly:

```bash
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode during development
```

### Feature-Specific Testing

For faster development cycles, run tests only for a specific feature:

```bash
npm run test:feature auth   # Run only auth feature tests
npm run test:feature posts  # Run only posts feature tests
```

This is especially useful when working on a single feature with 200+ total tests, as it significantly reduces test execution time while maintaining focused testing.

### Test Organization

- **Feature tests** are located in `src/features/{feature}/__tests__/`
- **Shared utility tests** are in `src/lib/__tests__/`
- **Integration tests** may span multiple features when testing complex interactions

---
