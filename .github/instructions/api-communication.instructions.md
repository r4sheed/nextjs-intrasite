---
description: 'Guidelines for API Communication and Data Fetching'
applyTo: 'src/features/**/actions/*.ts, src/features/**/services/*.ts, src/hooks/use-action.tsx'
---

# API Communication & Data Fetching Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** Next.js Server Actions, TanStack Query, Zod

---

## Overview

This document outlines the standard pattern for communication between the client and server, including data fetching, mutations, and validation.

---

## Core Principles

1.  **Server Actions as the API Layer**: All client-server communication should happen through Next.js Server Actions.
2.  **Type-Safe `Response<T>` Pattern**: All server actions must return the unified `Response<T>` type defined in `src/lib/response.ts`. This ensures predictable and type-safe handling of success, error, and partial states.
3.  **TanStack Query for Client-Side State**: Use TanStack Query (`useQuery`, `useMutation`) to manage server state on the client.
4.  **Zod for Validation**: All input from the client must be validated on the server using Zod schemas.

---

## The Flow of a Mutation (e.g., Creating a Post)

1.  **Client Component (`post-form.tsx`)**:
    - A form is rendered using `react-hook-form`.
    - `useMutation` from TanStack Query is used to handle the mutation.
    - The `mutationFn` calls the `execute` adapter, passing the server action and form data.
    - The component displays loading states, success messages, and error messages based on the mutation's status.

2.  **`execute` Adapter (`src/hooks/use-action.tsx`)**:
    - This adapter acts as a bridge between the `Response<T>` pattern and TanStack Query's promise-based `throwOnError` pattern.
    - It calls the server action.
    - If the action returns a `Status.Success` or `Status.Partial` response, it returns the response data.
    - If the action returns a `Status.Error` response, it **throws** the error response, which is then caught by `useMutation` and placed in `mutation.error`.

3.  **Server Action (`src/features/posts/actions/create-post.ts`)**:
    - The action receives the form data.
    - It uses a Zod schema (`createPostSchema`) to validate the input. If validation fails, it returns a `response.error()` with validation details.
    - If validation succeeds, it calls the corresponding service function (`createPostService`).
    - It returns the `Response<T>` from the service directly to the client.

4.  **Service (`src/features/posts/services/create-post.ts`)**:
    - This is where the core business logic resides.
    - It interacts with the data layer (e.g., `db.post.create()`).
    - It handles any domain-specific errors (e.g., "user does not have permission to post").
    - It returns a `response.success()` with the created data or a `response.error()` with a specific `AppError`.

> For a complete reference on the `Response<T>` type, `AppError`, and helper functions, see [error-handling-guidelines.instructions.md](error-handling-guidelines.instructions.md).

---

## Data Fetching (`useQuery`)

- For read-only operations, create a server action that fetches data and returns a `Response<T>`.
- On the client, use `useQuery` to call this server action.
- TanStack Query will handle caching, re-fetching, and background updates automatically.
