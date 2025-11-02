# Feature Creation Guide

## Quick Start

Create a new feature using the scaffolding script:

```bash
npm run feature:create <feature-name> [category]
```

### Categories

- **`crud`** (default): Full CRUD operations with domain models
  - Use for: posts, products, bookmarks, users, orders
  - Includes: `models/` folder with business entity classes
  - Template: Complete CRUD data layer + domain model examples

- **`simple`**: Lightweight features without domain models
  - Use for: settings, notifications, preferences, utilities
  - Excludes: `models/` folder (no complex domain logic needed)
  - Template: Basic service and data layer examples

### Examples

```bash
# CRUD feature with domain model (default)
npm run feature:create posts
npm run feature:create posts crud

# Simple feature without domain model
npm run feature:create settings simple
npm run feature:create notifications simple
```

This automatically creates the complete folder structure following project guidelines.

---

## Generated Structure

### CRUD Category (with domain models)

```
src/features/<feature-name>/
├── actions/          # Server Actions (Next.js 'use server')
│   ├── index.ts      # Barrel exports
│   └── create-example.ts   # Example server action template
├── components/       # React components specific to this feature
│   └── example.tsx   # Example component template
├── data/             # Database/data access layer
│   └── example.ts    # Full CRUD operations template
├── models/           # Domain models (business entities) ⭐ CRUD only
│   └── index.ts      # Domain entity class with business logic
├── hooks/            # Custom React hooks
│   └── index.ts      # TanStack Query hook examples
├── lib/              # Utilities, errors, and constants
│   ├── errors.ts     # Feature-specific AppError factories
│   ├── strings.ts    # Error codes, messages, UI labels (i18n keys)
│   └── utils.ts      # Feature-specific utilities
├── schemas/          # Zod validation schemas
│   ├── index.ts      # Barrel exports
│   └── create-example.ts   # Example Zod schema
├── services/         # Business logic layer
│   ├── index.ts      # Barrel exports
│   └── create-example.ts   # Example service with model usage
├── types/            # TypeScript type definitions
│   └── index.ts      # Shared types
├── __tests__/        # Unit and integration tests
│   └── example.test.ts     # Example test template
└── README.md         # Feature documentation (category-specific)

src/locales/
├── en/<feature-name>.json   # English translations (pre-populated)
└── hu/<feature-name>.json   # Hungarian translations (pre-populated)
```

### Simple Category (lightweight)

Same as CRUD, but **without** the `models/` folder. Best for features that don't require complex domain logic or business entity representations.

---

## Layer Responsibilities

> **Note:** CRUD features include a `models/` layer; simple features do not.

### 1. **Actions Layer** (`actions/`)

**Purpose:** Server Actions that handle form submissions and client requests

**Rules:**

- ✅ Always return `Response<T>`
- ✅ Validate input with Zod schemas (from `schemas/`)
- ✅ Call service layer for business logic
- ❌ Never throw errors (return `response.error()` instead)
- ❌ Never access database directly

**Template includes:** Example server action with validation and service call

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

// actions/create-bookmark.ts

// actions/create-bookmark.ts

// actions/create-bookmark.ts

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
- ✅ Use domain models (CRUD features) for business logic
- ✅ Handle all business rules and validation
- ✅ Use try-catch for unexpected errors only
- ❌ Never throw domain errors (return `response.error()`)

**Template includes:** Example service with model usage (CRUD) or direct data access (simple)

**Example (CRUD with model):**

```typescript
// services/create-post.ts
import { internalServerError } from '@/lib/errors';
import { response, type Response } from '@/lib/response';

import { createPost as createPostData } from '@/features/posts/data/post';

import { Post } from '@/features/posts/models';

export const createPost = async (
  input: CreatePostInput
): Promise<Response<CreatePostData>> => {
  try {
    // 1. Validate business rules using domain model
    if (!Post.isValidTitle(input.title)) {
      return response.error(invalidTitle());
    }

    // 2. Create entity in database
    const postData = await createPostData(input);

    if (!postData) {
      return response.error(internalServerError());
    }

    // 3. Return success
    return response.success({ data: { id: postData.id } });
  } catch (error) {
    console.error('[createPostService]', error);
    return response.error(internalServerError());
  }
};
```

**Example (simple without model):**

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

**Template includes:** Full CRUD operations (create, get, update, delete, list)

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

export const updateBookmark = async (
  id: string,
  data: Partial<CreateBookmarkInput>
) => {
  try {
    return await db.bookmark.update({ where: { id }, data });
  } catch (error) {
    console.error('[updateBookmark] Database error:', error);
    return null;
  }
};

export const deleteBookmark = async (id: string) => {
  try {
    return await db.bookmark.delete({ where: { id } });
  } catch (error) {
    console.error('[deleteBookmark] Database error:', error);
    return null;
  }
};

export const getAllBookmarks = async () => {
  try {
    return await db.bookmark.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('[getAllBookmarks] Database error:', error);
    return null;
  }
};
```

### 4. **Models Layer** (`models/`) - CRUD Category Only ⭐

**Purpose:** Domain entity classes with business logic

**Rules:**

- ✅ Class-based entity representations
- ✅ Contain core business logic and rules
- ✅ Validate entity state and invariants
- ✅ Transform between database and domain representations
- ❌ No database access (use data layer)
- ❌ No framework dependencies

**Template includes:** Complete domain model class with factory methods and business logic

**Example:**

```typescript
// models/index.ts
import type { Post as PrismaPost } from '@prisma/client';

// Business rule constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_RECENT_DAYS = 7;
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 200;

/**
 * Post domain entity
 * Wraps database entity with business logic
 */
export class Post {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly published: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create a new Post instance from database entity
   */
  static fromDatabase(data: PrismaPost): Post {
    return new Post(
      data.id,
      data.title,
      data.content,
      data.published,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Convert to database representation
   */
  toDatabase(): Omit<PrismaPost, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: this.title,
      content: this.content,
      published: this.published,
    };
  }

  /**
   * Business logic: Check if post is recent
   */
  isRecent(days: number = DEFAULT_RECENT_DAYS): boolean {
    const daysSinceCreation =
      (Date.now() - this.createdAt.getTime()) / MILLISECONDS_PER_DAY;
    return daysSinceCreation <= days;
  }

  /**
   * Business logic: Validate title
   */
  static isValidTitle(title: string): boolean {
    const trimmedLength = title.trim().length;
    return (
      trimmedLength >= MIN_TITLE_LENGTH && trimmedLength <= MAX_TITLE_LENGTH
    );
  }

  /**
   * Business logic: Publish post
   */
  publish(): Post {
    return new Post(
      this.id,
      this.title,
      this.content,
      true,
      this.createdAt,
      new Date()
    );
  }
}
```

**When to use models:**

- ✅ Complex business rules (order calculations, post publishing, user roles)
- ✅ Entity state validation (email formats, price ranges, status transitions)
- ✅ Transformations between layers (API ↔ database ↔ domain)
- ❌ Simple CRUD with no business logic (use simple category)

### 5. **Schemas Layer** (`schemas/`)

**Purpose:** Zod validation schemas and input types

**Rules:**

- ✅ Use Zod for runtime validation
- ✅ Export schema and inferred type
- ✅ Use i18n keys for error messages
- ❌ No business logic

**Template includes:** Example Zod schema with i18n error messages

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

### 6. **Lib Layer** (`lib/`)

**Purpose:** Feature-specific utilities, errors, and constants

**Files:**

- `strings.ts` - All string constants (codes, messages, labels)
- `errors.ts` - AppError factory functions
- `utils.ts` - Feature-specific helper functions

**Template includes:** Complete strings.ts with all constant categories, error factories, and utility placeholder

**Example (`lib/strings.ts`):**

```typescript
// lib/strings.ts

// Note: For kebab-case feature names (e.g., user-settings):
// - Constant name: USER_SETTINGS_CODES (UPPER_SNAKE_CASE)
// - i18n keys: user-settings.errors.not-found (kebab-case)
// - Prisma model: userSettings (camelCase)

export const BOOKMARK_CODES = {
  notFound: 'not-found',
  invalidUrl: 'invalid-url',
  titleRequired: 'title-required',
} as const;

export type BookmarkCode = (typeof BOOKMARK_CODES)[keyof typeof BOOKMARK_CODES];

export const BOOKMARK_ERRORS = {
  notFound: 'bookmarks.errors.not-found',
  invalidUrl: 'bookmarks.errors.invalid-url',
  titleRequired: 'bookmarks.errors.title-required',
} as const;

export const BOOKMARK_SUCCESS = {
  created: 'bookmarks.success.created',
  updated: 'bookmarks.success.updated',
  deleted: 'bookmarks.success.deleted',
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

### 1. Database Setup

- [ ] Add Prisma schema model to `prisma/schema.prisma`
- [ ] Run migration: `npx prisma migrate dev --name create-<feature>`
- [ ] Verify database structure

### 2. Translations

- [ ] Review generated `src/locales/en/<feature>.json`
- [ ] Review generated `src/locales/hu/<feature>.json`
- [ ] Add more translations: `npm run i18n:add <feature>.errors.custom "Text" "Szöveg"`
- [ ] Validate i18n files: `npm run i18n:validate`

### 3. Implementation

- [ ] **Data layer**: Customize CRUD operations in `data/example.ts`
- [ ] **Models layer** (CRUD only): Implement business logic in `models/index.ts`
- [ ] **Schemas**: Define validation rules in `schemas/create-example.ts`
- [ ] **Services**: Implement business logic in `services/create-example.ts`
- [ ] **Actions**: Customize server actions in `actions/create-example.ts`
- [ ] **Error handling**: Add domain-specific errors in `lib/errors.ts`
- [ ] **String constants**: Expand codes/messages in `lib/strings.ts`

### 4. UI & Integration

- [ ] Build UI components in `components/`
- [ ] Create custom hooks in `hooks/` (TanStack Query)
- [ ] Update feature `README.md` with usage examples
- [ ] Add route handlers if needed

### 5. Testing & Validation

- [ ] Write tests in `__tests__/`
- [ ] Run tests: `npm test`
- [ ] Run type check: `npm run typecheck`
- [ ] Test end-to-end functionality

### 6. Cleanup

- [ ] Remove example files if not needed:
  - `data/example.ts` → rename to actual entity (e.g., `bookmark.ts`)
  - `actions/create-example.ts` → rename to actual action
  - `services/create-example.ts` → rename to actual service
  - etc.
- [ ] Update barrel exports in `index.ts` files

---

## Category Decision Guide

**Choose CRUD when:**

- ✅ Complex business rules (pricing, permissions, workflows)
- ✅ Entity state management (published/draft, active/inactive)
- ✅ Domain transformations (API ↔ database ↔ UI)
- ✅ Reusable business logic across multiple features
- ✅ Examples: posts, products, orders, bookmarks, users

**Choose Simple when:**

- ✅ Basic CRUD with minimal logic
- ✅ Configuration or settings storage
- ✅ Simple data transformations
- ✅ No complex business rules
- ✅ Examples: settings, notifications, preferences, tags

---

## Retrofitting Existing Features with Models

Older features (like `auth`) may not have a `models/` folder. Here's when and how to add one:

### When to Add Models to Existing Features

**✅ Add models when you find:**

1. **Business Logic in Data Layer**

   ```typescript
   // ❌ BAD: Business logic (bcrypt) in data layer
   export const verifyUserCredentials = async (
     email: string,
     password: string
   ) => {
     const user = await getUserByEmail(email);
     const isValid = await bcrypt.compare(password, user.password); // Business logic!
     return isValid ? user : null;
   };
   ```

2. **Business Logic in Services**

   ```typescript
   // ❌ BAD: Password hashing scattered in multiple services
   export const registerUser = async (values: RegisterInput) => {
     const hashedPassword = await bcrypt.hash(password, 10); // Duplication!
     // ...
   };
   ```

3. **Domain Validation Scattered**
   ```typescript
   // ❌ BAD: Email validation copy-pasted across files
   if (!email.includes('@')) return error(); // Scattered validation
   ```

**❌ Don't add models when:**

1. Feature has simple CRUD with no complex business logic
2. Data layer only does database access (no transformations/validation)
3. Services only orchestrate calls (no domain logic)

### Migration Example: Auth Feature

See `docs/auth-user-model-migration.md` for complete case study.

**Summary:**

```typescript
// Before: Business logic in data/services
// data/user.ts
export const verifyUserCredentials = async (email, password) => {
  const user = await getUserByEmail(email);
  const isValid = await bcrypt.compare(password, user.password); // ❌ Business logic
  return isValid ? user : null;
};

// services/register-user.ts
const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS); // ❌ Business logic

// After: Business logic in User model
// models/user.ts
export class User {
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.data.password);
  }

  static async hashPassword(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
  }
}

// data/user.ts - Pure database access
export const verifyUserCredentials = async (email, password) => {
  const prismaUser = await getUserByEmail(email);
  if (!prismaUser) return null;

  const user = new User(prismaUser); // ✅ Use model
  const isValid = await user.verifyPassword(password);
  return isValid ? user.toSafeObject() : null;
};

// services/register-user.ts - Uses model
const hashedPassword = await User.hashPassword(password); // ✅ Use model
```

### Retrofit Checklist

- [ ] Identify business logic in data/services layers
- [ ] Create `models/` folder
- [ ] Create domain entity class (e.g., `User`, `Post`)
- [ ] Move business logic to model methods
- [ ] Update data layer to use model for business operations
- [ ] Update services to use model static methods
- [ ] Rename Prisma type imports: `User` → `User as PrismaUser`
- [ ] Run tests to ensure no regressions
- [ ] Create migration documentation

---

## Guidelines Reference

- **Error Handling:** `../.github/instructions/error-handling-guidelines.instructions.md`
- **Naming:** `../.github/instructions/naming-conventions.instructions.md`
- **Messages & Codes:** `../.github/instructions/messages-and-codes.instructions.md`
- **Next.js Patterns:** `../.github/instructions/nextjs.instructions.md`
- **TypeScript:** `../.github/instructions/typescript-5-es2022.instructions.md`
- **Governance:** `../.github/instructions/guidelines-governance.instructions.md`
- **i18n Management:** `i18n-management.prompt.md`
