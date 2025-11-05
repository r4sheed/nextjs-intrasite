---
description: 'Guidelines for State Management in Next.js + TypeScript Applications'
applyTo: 'src/hooks/**/*.ts, src/components/**/*.tsx, src/features/**/*.ts'
---

# State Management Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** React, Next.js, TanStack Query

---

## Overview

This document provides guidelines for managing state in the application. A consistent state management strategy is crucial for building predictable, maintainable, and scalable applications.

---

## Core Principles

1.  **Server State vs. Client State**: Clearly distinguish between server state (data from the backend) and client state (UI-related state).
2.  **Use the Right Tool for the Job**:
    - **TanStack Query**: For managing all server state (fetching, caching, updating).
    - **React Hooks (`useState`, `useReducer`)**: For local, component-specific client state.
    - **Context API**: For global client state that needs to be shared across the application (e.g., theme, user session).
    - **URL State**: For state that should be bookmarkable and shareable (e.g., filters, search queries).
3.  **Single Source of Truth**: Avoid duplicating state. Data should have a single, authoritative source.

---

## Server State (TanStack Query)

All interactions with the backend API should be managed through TanStack Query.

- **`useQuery`**: For fetching data.
- **`useMutation`**: For creating, updating, or deleting data.
- **Query Keys**: Use descriptive and structured query keys to manage caching effectively.
- **Optimistic Updates**: Use optimistic updates for a better user experience, but ensure proper error handling and rollback.

> For detailed patterns on using `useMutation` with server actions, see the `execute` adapter in [error-handling-guidelines.instructions.md](error-handling-guidelines.instructions.md).

---

## Client State

### Local State (`useState`, `useReducer`)

- **`useState`**: Use for simple, local state within a single component (e.g., form input values, toggle states).
- **`useReducer`**: Use for more complex state logic involving multiple sub-values or when the next state depends on the previous one. It is particularly useful for managing state in complex forms or components with many user interactions.
- **Lift State Up**: When multiple components need to share state, lift it up to their closest common ancestor.

### Global State (Context API)

- **Use Context Sparingly**: Context is powerful but can lead to performance issues if overused. Only use it for truly global state that doesn't change often.
- **Good Use Cases**:
  - Theme (dark/light mode)
  - User authentication status
  - Application-wide settings
- **Separate Contexts**: Split contexts by domain to prevent components from re-rendering unnecessarily. For example, have a `ThemeProvider` and a separate `SessionProvider`.

### URL State

- **Use `useRouter` and `useSearchParams`**: Store state in the URL query parameters to make it shareable and persistent across reloads.
- **Good Use Cases**:
  - Search queries
  - Filters and sorting preferences
  - Pagination state
- **Debounce Updates**: When updating URL state based on user input (e.g., a search bar), debounce the updates to avoid excessive re-renders and history entries.
