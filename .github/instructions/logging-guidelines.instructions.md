---
description: 'Logging Guidelines for Next.js + TypeScript Applications'
applyTo: '**'
---

# Logging Guidelines

**Version:** 1.0
**Last Updated:** November 2025
**Target:** Next.js 15+, TypeScript 5+, Pino Logger

## Overview

This document establishes a **unified, structured logging pattern** for the application using Pino logger. The goal is to replace all `console.log`/`console.error` calls with structured, searchable, and configurable logging that supports different environments and log levels.

### Core Principles

1. **Structured Logging**: Use Pino for JSON-structured logs with consistent fields
2. **Environment-Aware**: Different log levels and formats for development vs production
3. **Contextual Logging**: Child loggers with persistent context for modules/features
4. **Type Safety**: TypeScript interfaces for log data
5. **Performance**: Async logging that doesn't block application flow
6. **Searchability**: Consistent field names and values for log aggregation

## Logger Architecture

### Core Logger (`src/lib/logger.ts`)

The application uses a centralized Pino logger with environment-based configuration:

```typescript
// Development: Pretty-printed, debug level
// Production: JSON format, info level and above
// Test: Error level only, silent output
```

### Child Loggers

Each module/feature gets a child logger with persistent context:

```typescript
const authLogger = logger.forAuth();
const dbLogger = logger.forDatabase();
const httpLogger = logger.forRequest();
```

### Module Registry

All module names are centralized in `LOG_MODULES` to ensure consistency:

```typescript
export const LOG_MODULES = {
  auth: 'auth',
  database: 'database',
  http: 'http',
  analytics: 'analytics',
  // ... add new modules here
} as const;
```

## Usage Patterns

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Info level (default for important events)
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Error level (for errors)
logger.error('Database connection failed', { error: err.message, code: 'DB_CONN_FAIL' });

// Debug level (development only)
logger.debug('Processing user data', { userId, dataSize: data.length });
```

### Module-Specific Logging

```typescript
import { logger } from '@/lib/logger';

// Auth module logging
const authLogger = logger.forAuth();
authLogger.info('Login attempt', { email, ip: req.ip });
authLogger.error('Invalid credentials', { email, attemptCount });

// Database module logging
const dbLogger = logger.forDatabase();
dbLogger.info('Query executed', { table: 'users', duration: 150 });
dbLogger.error('Query failed', { query, error: err.message });

// HTTP request logging
const httpLogger = logger.forRequest();
httpLogger.info('Request started', { method: 'POST', url: '/api/auth/login' });
httpLogger.error('Request failed', { status: 500, error: err.message });
```

## Best Practices

### DO ✅

1. **Use structured data** - Pass objects instead of string concatenation
2. **Include context** - Add userId, sessionId, correlationId when available
3. **Use appropriate levels** - Info for business events, error for failures
4. **Use child loggers** - `logger.forModule()` for module-specific context
5. **Log errors with full context** - Include stack traces and operation details
6. **Use LOG_MODULES constants** - Never hardcode module names
7. **Log performance metrics** - Duration, size, counts for monitoring
8. **Use correlation IDs** - For request tracing across services

### DON'T ❌

1. **Don't use console.log/error** - Always use the logger
2. **Don't log sensitive data** - No passwords, tokens, PII in logs
3. **Don't log in loops** - Batch or sample for high-frequency operations
4. **Don't use string concatenation** - Use structured objects
5. **Don't hardcode module names** - Use LOG_MODULES constants
6. **Don't log unnecessary details** - Keep logs focused and searchable
7. **Don't block on logging** - Pino is async and non-blocking

## Summary

This logging system provides:

✅ **Structured, searchable logs** for better debugging and monitoring
✅ **Environment-aware configuration** for development and production
✅ **Type-safe logging API** with TypeScript support
✅ **Performance-optimized** async logging
✅ **Security-conscious** approach to sensitive data
✅ **Scalable architecture** with child loggers and modules
✅ **Monitoring-ready** JSON output for log aggregation

Follow these guidelines for all new logging and migrate existing console calls to maintain consistency across the application.
