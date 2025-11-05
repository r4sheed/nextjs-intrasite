---
description: 'Security Guidelines for Next.js + TypeScript Applications'
applyTo: '**'
---

# Security Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** Next.js, NextAuth, Prisma

---

## Overview

This document outlines critical security practices that must be followed to protect the application and its users from common vulnerabilities.

---

## Core Principles

1.  **Never Trust the Client**: All data coming from the client must be validated and sanitized on the server.
2.  **Principle of Least Privilege**: Users and services should only have access to the resources and data they absolutely need.
3.  **Defense in Depth**: Use multiple layers of security controls.
4.  **Secure by Default**: Configure frameworks and libraries to be secure by default.

---

## Authentication & Authorization

- **NextAuth.js**: Use NextAuth.js for all authentication logic.
- **Protect Server Actions and API Routes**:
  - Use `auth()` from NextAuth.js at the beginning of any sensitive server action or API route to get the current session.
  - If the session is null, the user is not authenticated. Return an `unauthorized` error.
- **Role-Based Access Control (RBAC)**:
  - Check the user's role from the session object before allowing access to protected resources.
  - Return a `forbidden` error if the user does not have the required role.

---

## Input Validation

- **Use Zod**: Validate **all** incoming data in server actions and API routes with Zod schemas. This includes form data, URL parameters, and request bodies.
- **Be Specific**: Define schemas with specific types, lengths, and formats (e.g., `z.string().email()`, `z.string().min(8)`).

---

## Database Security (Prisma)

- **No Raw SQL**: Never use raw SQL queries with user-provided input. Use Prisma's query builder, which automatically parameterizes queries to prevent SQL injection.
- **Data Sanitization**: While Prisma helps prevent SQL injection, always validate data with Zod before sending it to the database.
- **Never Expose Sensitive Data**: When returning data to the client, explicitly select the fields to include and omit sensitive information like passwords, tokens, etc.

```typescript
// Example: Returning a user object without the password
const user = await db.user.findUnique({ where: { id } });
if (user) {
  const { password, ...userWithoutPassword } = user;
  return response.success({ data: userWithoutPassword });
}
```

---

## Cross-Site Scripting (XSS)

- **React Escapes by Default**: React automatically escapes content rendered in JSX, which prevents most XSS attacks.
- **Avoid `dangerouslySetInnerHTML`**: Never use this prop with user-provided content.
- **Sanitize HTML**: If you must render HTML from a trusted source (like a rich text editor), use a library like `dompurify` to sanitize it first.

---

## Environment Variables

- **Store Secrets in `.env.local`**: All secret keys (API keys, database URLs, etc.) must be stored in `.env.local`, which is not committed to version control.
- **Do Not Expose Secrets to the Client**: By default, environment variables are only available on the server. Do not prefix them with `NEXT_PUBLIC_` unless they are explicitly non-sensitive and required on the client.
