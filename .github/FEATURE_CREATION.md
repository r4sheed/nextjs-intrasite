# Feature Creation Guide

## Quick Start

Create a new feature using the scaffolding script:

```bash
npm run feature:create <feature-name>
```

**Example:**

```bash
npm run feature:create bookmarks
```

This automatically creates the complete folder structure following project guidelines.

---

## Generated Structure

```
src/features/<feature-name>/
├── actions/          # Server Actions (Next.js 'use server')
│   └── index.ts      # Barrel exports
├── components/       # React components specific to this feature
├── data/             # Database/data access layer
├── hooks/            # Custom React hooks
├── lib/              # Utilities, errors, and constants
│   ├── errors.ts     # Feature-specific AppError factories
│   └── strings.ts    # Error codes, messages, UI labels (i18n keys)
├── schemas/          # Zod validation schemas
│   └── index.ts      # Barrel exports
├── services/         # Business logic layer
│   └── index.ts      # Barrel exports
├── types/            # TypeScript type definitions
│   └── index.ts      # Shared types
├── __tests__/        # Unit and integration tests
└── README.md         # Feature documentation

src/locales/
├── en/<feature-name>.json   # English translations
└── hu/<feature-name>.json   # Hungarian translations
```

---

## Layer Responsibilities

### 1. **Actions Layer** (`actions/`)

**Purpose:** Server Actions that handle form submissions and client requests

**Rules:**

- ✅ Always return `Response<T>`
- ✅ Validate input with Zod schemas (from `schemas/`)
- ✅ Call service layer for business logic
- ❌ Never throw errors (return `response.error()` instead)
- ❌ Never access database directly

**Example:**

```typescript
// actions/create-bookmark.ts
'use server';

import { response, type Response } from '@/lib/response';

import { invalidFields } from '@/features/bookmarks/lib/errors';

import {
  type CreateBookmarkInput,
  createBookmarkSchema,
} from '@/features/bookmarks/schemas';
import { createBookmark as createBookmarkService } from '@/features/bookmarks/services';

// actions/create-bookmark.ts

export type CreateBookmarkData = { id: string };

export const createBookmark = async (
  values: CreateBookmarkInput
): Promise<Response<CreateBookmarkData>> => {
  const result = createBookmarkSchema.safeParse(values);

  if (!result.success) {
    return response.error(invalidFields(result.error.issues));
  }

  return await createBookmarkService(result.data);
};
```

### 2. **Services Layer** (`services/`)

**Purpose:** Business logic and orchestration

**Rules:**

- ✅ Return `Response<T>`
- ✅ Call data layer for database operations
- ✅ Handle all business rules and validation
- ✅ Use try-catch for unexpected errors only
- ❌ Never throw domain errors (return `response.error()`)

**Example:**

```typescript
// services/create-bookmark.ts
import { internalServerError } from '@/lib/errors';
import { response, type Response } from '@/lib/response';

import { createBookmark as createBookmarkData } from '@/features/bookmarks/data/bookmark';

import { type CreateBookmarkData } from '@/features/bookmarks/actions';

export const createBookmark = async (
  data: CreateBookmarkInput
): Promise<Response<CreateBookmarkData>> => {
  try {
    const bookmark = await createBookmarkData(data);

    if (!bookmark) {
      return response.error(internalServerError());
    }

    return response.success({ data: { id: bookmark.id } });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return response.error(internalServerError());
  }
};
```

### 3. **Data Layer** (`data/`)

**Purpose:** Direct database access

**Rules:**

- ✅ Return `null` on errors (log them first)
- ✅ Pure data access functions only
- ✅ Log database errors to console
- ❌ Never throw errors
- ❌ No business logic

**Example:**

```typescript
// data/bookmark.ts
import { db } from '@/lib/prisma';

export const createBookmark = async (data: CreateBookmarkInput) => {
  try {
    return await db.bookmark.create({ data });
  } catch (error) {
    console.error('[createBookmark] Database error:', error);
    return null;
  }
};

export const getBookmarkById = async (id: string) => {
  try {
    return await db.bookmark.findUnique({ where: { id } });
  } catch (error) {
    console.error('[getBookmarkById] Database error:', error);
    return null;
  }
};
```

### 4. **Schemas Layer** (`schemas/`)

**Purpose:** Zod validation schemas and input types

**Rules:**

- ✅ Use Zod for runtime validation
- ✅ Export schema and inferred type
- ✅ Use i18n keys for error messages
- ❌ No business logic

**Example:**

```typescript
// schemas/create-bookmark.ts
import { z } from 'zod';

import { BOOKMARK_ERRORS } from '@/features/bookmarks/lib/strings';

export const createBookmarkSchema = z.object({
  title: z.string().min(1, { message: BOOKMARK_ERRORS.titleRequired }),
  url: z.string().url({ message: BOOKMARK_ERRORS.invalidUrl }),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
```

### 5. **Lib Layer** (`lib/`)

**Purpose:** Feature-specific utilities, errors, and constants

**Files:**

- `strings.ts` - All string constants (codes, messages, labels)
- `errors.ts` - AppError factory functions

**Example (`lib/strings.ts`):**

```typescript
export const BOOKMARK_CODES = {
  notFound: 'not-found',
  invalidUrl: 'invalid-url',
  titleRequired: 'title-required',
} as const;

export const BOOKMARK_ERRORS = {
  notFound: 'bookmarks.errors.not-found',
  invalidUrl: 'bookmarks.errors.invalid-url',
  titleRequired: 'bookmarks.errors.title-required',
} as const;

export const BOOKMARK_SUCCESS = {
  created: 'bookmarks.success.created',
  updated: 'bookmarks.success.updated',
} as const;

export const BOOKMARK_LABELS = {
  title: 'bookmarks.labels.title',
  createButton: 'bookmarks.labels.create-button',
} as const;
```

**Example (`lib/errors.ts`):**

```typescript
import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { BOOKMARK_CODES, BOOKMARK_ERRORS } from './strings';

export const bookmarkNotFound = (id: string) =>
  new AppError({
    code: BOOKMARK_CODES.notFound,
    message: { key: BOOKMARK_ERRORS.notFound, params: { id } },
    httpStatus: HTTP_STATUS.NOT_FOUND,
  });
```

---

## Naming Conventions

### Files

- **kebab-case** for all files: `create-bookmark.ts`, `bookmark-list.tsx`

### Functions & Variables

- **camelCase** for functions: `createBookmark`, `getBookmarkById`
- **camelCase** for variables: `bookmarkData`, `userId`

### Types & Interfaces

- **PascalCase** for types: `CreateBookmarkData`, `BookmarkInput`

### Constants

- **SCREAMING_SNAKE_CASE** for primitives: `const MAX_BOOKMARKS = 100`
- **camelCase** for objects/arrays: `const bookmarkRoutes = [...]`
- **camelCase properties** with **kebab-case values**:
  ```typescript
  const BOOKMARK_CODES = {
    notFound: 'not-found', // property: camelCase, value: kebab-case
  } as const;
  ```

---

## i18n Setup

After creating a feature, add translations:

**`src/locales/en/<feature-name>.json`:**

```json
{
  "bookmarks": {
    "errors": {
      "not-found": "Bookmark not found",
      "invalid-url": "Please enter a valid URL"
    },
    "success": {
      "created": "Bookmark created successfully",
      "updated": "Bookmark updated"
    },
    "labels": {
      "title": "Bookmarks",
      "create-button": "Create Bookmark"
    }
  }
}
```

---

## Testing

Write tests in `__tests__/` directory:

```typescript
// __tests__/create-bookmark.test.ts
import { describe, expect, it } from 'vitest';

import { Status } from '@/lib/response';

import { createBookmark } from '../actions';

describe('createBookmark', () => {
  it('should create bookmark with valid data', async () => {
    const result = await createBookmark({
      title: 'Test',
      url: 'https://example.com',
    });

    expect(result.status).toBe(Status.Success);
    if (result.status === Status.Success) {
      expect(result.data).toHaveProperty('id');
    }
  });
});
```

---

## Checklist

After generating a feature:

- [ ] Add translations to `src/locales/en/<feature>.json`
- [ ] Add translations to `src/locales/hu/<feature>.json`
- [ ] Define error codes in `lib/strings.ts`
- [ ] Create Zod schemas in `schemas/`
- [ ] Implement data access functions in `data/`
- [ ] Write business logic in `services/`
- [ ] Create server actions in `actions/`
- [ ] Build UI components in `components/`
- [ ] Write tests in `__tests__/`
- [ ] Update feature `README.md` with usage examples

---

## Guidelines Reference

- **Error Handling:** `.github/instructions/error-handling-guidelines.instructions.md`
- **Naming:** `.github/instructions/naming-conventions.instructions.md`
- **Messages & Codes:** `.github/instructions/messages-and-codes.instructions.md`
- **Next.js Patterns:** `.github/instructions/nextjs.instructions.md`
- **TypeScript:** `.github/instructions/typescript-5-es2022.instructions.md`
- **Governance:** `.github/instructions/guidelines-governance.instructions.md`
