#!/usr/bin/env tsx
/**
 * Feature Scaffolding Script
 *
 * Creates a complete feature folder structure following project guidelines.
 * Supports different feature categories with appropriate templates.
 *
 * Usage:
 *   npm run feature:create <feature-name> [category]
 *
 * Categories:
 *   - crud (default): Full CRUD operations with models (posts, products, etc.)
 *   - simple: Lightweight features (settings, notifications, etc.)
 *
 * Examples:
 *   npm run feature:create posts           # Creates CRUD feature with model
 *   npm run feature:create posts crud      # Same as above
 *   npm run feature:create settings simple # Creates simple feature
 *
 * @see .github/prompts/feature-creation.prompt.md
 * @see .github/instructions/naming-conventions.instructions.md
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type FeatureCategory = 'crud' | 'simple';

// Layer descriptions for documentation
const LAYER_DOCS = {
  actions: `Server Actions (Next.js 'use server')
  - Handle form submissions and client requests
  - Always return Response<T>
  - Validate input with Zod schemas
  - Call service layer for business logic
  - Never throw errors (use response.error())`,

  services: `Business Logic Layer
  - Orchestrate data operations and business rules
  - Return Response<T> for all operations
  - Use try-catch only for unexpected errors
  - Call data layer for database access
  - Implement domain-specific validations`,

  data: `Data Access Layer (Database Operations)
  - Pure database CRUD operations
  - Return null on errors (with console.error logging)
  - Never throw errors
  - No business logic
  - Use Prisma client for database access`,

  models: `Domain Models (Business Entities)
  - Class-based representations of domain entities
  - Contain core business logic and rules
  - Validate entity state
  - Transform between database and domain representations
  - Example: User.create(), Post.publish(), Order.calculate()`,

  schemas: `Zod Validation Schemas
  - Define input validation rules
  - Export schema and inferred TypeScript type
  - Use i18n keys for error messages
  - No business logic`,

  components: `React Components
  - UI components specific to this feature
  - Use shadcn/ui primitives
  - Handle user interactions
  - Display feature-specific data`,

  hooks: `Custom React Hooks
  - Feature-specific React hooks
  - Manage component state and side effects
  - Use TanStack Query for server state
  - Example: useBookmarks(), usePost()`,

  lib: `Utilities, Errors, and Constants
  - strings.ts: Error codes, i18n keys, labels
  - errors.ts: AppError factory functions
  - utils.ts: Feature-specific helper functions`,

  types: `TypeScript Type Definitions
  - Shared types and interfaces
  - Domain entity types
  - API response types`,

  __tests__: `Unit and Integration Tests
  - Test actions, services, and data layers
  - Use Vitest and testing utilities
  - Mock external dependencies`,
};

// Template content for each file type
const templates = {
  'lib/strings.ts': (featureName: string, FeatureName: string) => {
    // Convert kebab-case to UPPER_SNAKE_CASE for constant names
    const CONSTANT_NAME = featureName.toUpperCase().replace(/-/g, '_');

    return `/**
 * ${FeatureName} feature string constants
 * Error codes, messages, and UI labels
 *
 * @see .github/instructions/messages-and-codes.instructions.md
 */

/**
 * ${FeatureName} error codes (kebab-case, URL-friendly)
 * Used in AppError code field and URL parameters
 */
export const ${CONSTANT_NAME}_CODES = {
  notFound: 'not-found',
  invalidInput: 'invalid-input',
  // Add more error codes here
} as const;

export type ${FeatureName}Code = (typeof ${CONSTANT_NAME}_CODES)[keyof typeof ${CONSTANT_NAME}_CODES];

/**
 * ${FeatureName} error messages (i18n keys)
 * User-facing error messages for forms, toasts, error pages
 */
export const ${CONSTANT_NAME}_ERRORS = {
  notFound: '${featureName}.errors.not-found',
  invalidInput: '${featureName}.errors.invalid-input',
  // Add more error messages here
} as const;

/**
 * ${FeatureName} success messages (i18n keys)
 * Confirmation messages for successful operations
 */
export const ${CONSTANT_NAME}_SUCCESS = {
  created: '${featureName}.success.created',
  updated: '${featureName}.success.updated',
  deleted: '${featureName}.success.deleted',
} as const;

/**
 * ${FeatureName} UI labels (i18n keys)
 * Static UI text: titles, labels, placeholders, buttons
 */
export const ${CONSTANT_NAME}_LABELS = {
  title: '${featureName}.labels.title',
  createButton: '${featureName}.labels.create-button',
  // Add more UI labels here
} as const;
`;
  },

  'lib/errors.ts': (featureName: string, FeatureName: string) => {
    const CONSTANT_NAME = featureName.toUpperCase().replace(/-/g, '_');
    const functionName = featureName.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    return `import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { ${CONSTANT_NAME}_CODES, ${CONSTANT_NAME}_ERRORS } from './strings';

/**
 * ${FeatureName} error factory functions
 * Create structured AppError instances for common error scenarios
 *
 * @see .github/instructions/error-handling-guidelines.instructions.md
 */

/**
 * 404 - ${FeatureName} not found
 */
export const ${functionName}NotFound = (id: string) =>
  new AppError({
    code: ${CONSTANT_NAME}_CODES.notFound,
    message: { key: ${CONSTANT_NAME}_ERRORS.notFound, params: { id } },
    httpStatus: HTTP_STATUS.NOT_FOUND,
  });

/**
 * 422 - Invalid input validation
 */
export const invalidInput = (details: unknown) =>
  new AppError({
    code: ${CONSTANT_NAME}_CODES.invalidInput,
    message: { key: ${CONSTANT_NAME}_ERRORS.invalidInput },
    httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    details,
  });

// Add more error factories as needed
`;
  },

  'lib/utils.ts': (featureName: string, FeatureName: string) => `/**
 * ${FeatureName} utility functions
 * Feature-specific helper functions and transformations
 */

/**
 * Example utility function
 * Replace with actual feature-specific utilities
 */
export function format${FeatureName}Name(name: string): string {
  return name.trim().toLowerCase();
}

// Add more utilities as needed
`,

  'models/index.ts': (featureName: string, FeatureName: string) => `/**
 * ${FeatureName} domain model
 * Business logic and entity behavior
 *
 * Models represent domain entities with their core business rules.
 * They validate state, enforce invariants, and provide domain operations.
 */

import type { ${FeatureName} as Prisma${FeatureName} } from '@prisma/client';

// Business rule constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_RECENT_DAYS = 7;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;

/**
 * ${FeatureName} domain entity
 * Wraps database entity with business logic
 */
export class ${FeatureName} {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create a new ${FeatureName} instance from database entity
   */
  static fromDatabase(data: Prisma${FeatureName}): ${FeatureName} {
    return new ${FeatureName}(
      data.id,
      data.name,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Convert to database representation
   */
  toDatabase(): Omit<Prisma${FeatureName}, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: this.name,
    };
  }

  /**
   * Business logic: Check if ${featureName} is recent
   */
  isRecent(days: number = DEFAULT_RECENT_DAYS): boolean {
    const daysSinceCreation = 
      (Date.now() - this.createdAt.getTime()) / MILLISECONDS_PER_DAY;
    return daysSinceCreation <= days;
  }

  /**
   * Business logic: Validate ${featureName} name
   */
  static isValidName(name: string): boolean {
    const trimmedLength = name.trim().length;
    return trimmedLength >= MIN_NAME_LENGTH && trimmedLength <= MAX_NAME_LENGTH;
  }
}
`,

  'actions/index.ts': () => `/**
 * Barrel export for all server actions
 *
 * Export pattern: export { type XData, functionName } from './file-name'
 *
 * @see .github/instructions/naming-conventions.instructions.md
 */

// Example:
// export { type CreatePostData, createPost } from './create-post';
// export { type UpdatePostData, updatePost } from './update-post';
// export { type DeletePostData, deletePost } from './delete-post';
`,

  'actions/create-example.ts': (
    featureName: string,
    FeatureName: string
  ) => `'use server';

/**
 * Example server action for creating a ${featureName}
 * This is a template - adapt to your specific needs
 *
 * @see .github/instructions/error-handling-guidelines.instructions.md
 */

import { response, type Response } from '@/lib/response';

import { invalidInput } from '@/features/${featureName}/lib/errors';
import { create${FeatureName} as create${FeatureName}Service } from '@/features/${featureName}/services';

import {
  type Create${FeatureName}Input,
  create${FeatureName}Schema,
} from '@/features/${featureName}/schemas';

export type Create${FeatureName}Data = { id: string };

/**
 * Create a new ${featureName}
 */
export const create${FeatureName} = async (
  values: Create${FeatureName}Input
): Promise<Response<Create${FeatureName}Data>> => {
  // 1. Validate input
  const validation = create${FeatureName}Schema.safeParse(values);
  
  if (!validation.success) {
    return response.error(invalidInput(validation.error.issues));
  }

  // 2. Call service layer
  return await create${FeatureName}Service(validation.data);
};
`,

  'services/index.ts': () => `/**
 * Barrel export for all service functions
 *
 * Export pattern: export { functionName } from './file-name'
 */

// Example:
// export { createPost } from './create-post';
// export { updatePost } from './update-post';
// export { deletePost } from './delete-post';
// export { getPost } from './get-post';
`,

  'services/create-example.ts': (
    featureName: string,
    FeatureName: string
  ) => `/**
 * Example service for creating a ${featureName}
 * This is a template - adapt to your specific needs
 *
 * Services orchestrate business logic and data access.
 * They return Response<T> and handle domain-specific validations.
 */

import { internalServerError } from '@/lib/errors';
import { response, type Response } from '@/lib/response';

import { ${FeatureName} } from '@/features/${featureName}/models';
import { create${FeatureName} as create${FeatureName}Data } from '@/features/${featureName}/data/${featureName}';

import type { Create${FeatureName}Data } from '@/features/${featureName}/actions';
import type { Create${FeatureName}Input } from '@/features/${featureName}/schemas';

/**
 * Create a new ${featureName}
 */
export const create${FeatureName} = async (
  input: Create${FeatureName}Input
): Promise<Response<Create${FeatureName}Data>> => {
  try {
    // 1. Validate business rules using domain model
    if (!${FeatureName}.isValidName(input.name)) {
      return response.error(internalServerError());
    }

    // 2. Create entity in database
    const ${featureName}Data = await create${FeatureName}Data(input);

    if (!${featureName}Data) {
      return response.error(internalServerError());
    }

    // 3. Return success
    return response.success({ 
      data: { id: ${featureName}Data.id } 
    });
  } catch (error) {
    console.error('[create${FeatureName}Service]', error);
    return response.error(internalServerError());
  }
};
`,

  'data/example.ts': (featureName: string, FeatureName: string) => {
    // Convert kebab-case to camelCase for Prisma model (e.g. test-posts -> testPosts)
    const modelName = featureName.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    return `/**
 * Data access layer for ${FeatureName} entity
 * Pure database operations with Prisma
 *
 * This layer:
 * - Returns null on errors (with logging)
 * - Never throws errors
 * - Contains no business logic
 */

import { db } from '@/lib/prisma';

import type { Create${FeatureName}Input } from '@/features/${featureName}/schemas';

/**
 * Create a new ${featureName} in the database
 */
export const create${FeatureName} = async (data: Create${FeatureName}Input) => {
  try {
    return await db.${modelName}.create({ data });
  } catch (error) {
    console.error('[create${FeatureName}]', error);
    return null;
  }
};

/**
 * Find ${featureName} by ID
 */
export const get${FeatureName}ById = async (id: string) => {
  try {
    return await db.${modelName}.findUnique({ where: { id } });
  } catch (error) {
    console.error('[get${FeatureName}ById]', error);
    return null;
  }
};

/**
 * Update ${featureName}
 */
export const update${FeatureName} = async (id: string, data: Partial<Create${FeatureName}Input>) => {
  try {
    return await db.${modelName}.update({ where: { id }, data });
  } catch (error) {
    console.error('[update${FeatureName}]', error);
    return null;
  }
};

/**
 * Delete ${featureName}
 */
export const delete${FeatureName} = async (id: string) => {
  try {
    return await db.${modelName}.delete({ where: { id } });
  } catch (error) {
    console.error('[delete${FeatureName}]', error);
    return null;
  }
};

/**
 * Get all ${featureName}s
 */
export const getAll${FeatureName}s = async () => {
  try {
    return await db.${modelName}.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('[getAll${FeatureName}s]', error);
    return null;
  }
};
`;
  },

  'schemas/index.ts': () => `/**
 * Barrel export for all Zod schemas and types
 *
 * Export pattern: export { schemaName, type InputType } from './file-name'
 */

// Example:
// export { createPostSchema, type CreatePostInput } from './create-post';
// export { updatePostSchema, type UpdatePostInput } from './update-post';
`,

  'schemas/create-example.ts': (featureName: string, FeatureName: string) => {
    const CONSTANT_NAME = featureName.toUpperCase().replace(/-/g, '_');

    return `/**
 * Example Zod schema for creating a ${featureName}
 * This is a template - adapt to your specific needs
 */

import { z } from 'zod';

import { ${CONSTANT_NAME}_ERRORS } from '@/features/${featureName}/lib/strings';

/**
 * Schema for creating a ${featureName}
 */
export const create${FeatureName}Schema = z.object({
  name: z
    .string()
    .min(3, { message: ${CONSTANT_NAME}_ERRORS.invalidInput })
    .max(100, { message: ${CONSTANT_NAME}_ERRORS.invalidInput }),
  // Add more fields as needed
});

export type Create${FeatureName}Input = z.infer<typeof create${FeatureName}Schema>;
`;
  },

  'types/index.ts': (featureName: string, FeatureName: string) => `/**
 * ${FeatureName} feature type definitions
 *
 * Shared types, interfaces, and type utilities for the ${featureName} feature.
 * Keep types close to where they're used when possible.
 */

// Example domain types:
// export type ${FeatureName}Status = 'draft' | 'published' | 'archived';
// 
// export interface ${FeatureName}Filter {
//   status?: ${FeatureName}Status;
//   search?: string;
// }
`,

  'hooks/index.ts': (featureName: string, FeatureName: string) => `/**
 * Custom React hooks for ${featureName} feature
 *
 * Example hooks:
 * - use${FeatureName}s(): Query all ${featureName}s
 * - use${FeatureName}(id): Query single ${featureName}
 * - useCreate${FeatureName}(): Mutation for creating
 * - useUpdate${FeatureName}(): Mutation for updating
 * - useDelete${FeatureName}(): Mutation for deleting
 */

// Example:
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { get${FeatureName}s, create${FeatureName} } from '@/features/${featureName}/actions';
//
// export function use${FeatureName}s() {
//   return useQuery({
//     queryKey: ['${featureName}s'],
//     queryFn: get${FeatureName}s,
//   });
// }
`,

  'components/example.tsx': (featureName: string, FeatureName: string) => `/**
 * Example component for ${featureName} feature
 * This is a template - adapt to your specific needs
 */

'use client';

// import { use${FeatureName}s } from '@/features/${featureName}/hooks';

export function ${FeatureName}List() {
  // const { data, isLoading } = use${FeatureName}s();

  return (
    <div>
      <h2>${FeatureName} List</h2>
      {/* Add your component implementation here */}
    </div>
  );
}
`,

  '__tests__/example.test.ts': (
    featureName: string,
    FeatureName: string
  ) => `/**
 * Example tests for ${featureName} feature
 * This is a template - adapt to your specific needs
 */

import { describe, expect, it } from 'vitest';

import { Status } from '@/lib/response';

// import { create${FeatureName} } from '@/features/${featureName}/actions';

describe('${FeatureName} Feature', () => {
  describe('create${FeatureName}', () => {
    it('should create ${featureName} with valid data', async () => {
      // Add your test implementation here
      expect(true).toBe(true);
    });

    it('should return error with invalid data', async () => {
      // Add your test implementation here
      expect(true).toBe(true);
    });
  });
});
`,

  'README.md': (
    featureName: string,
    FeatureName: string,
    category: FeatureCategory
  ) => `# ${FeatureName} Feature

## Overview

${category === 'crud' ? `Full CRUD feature with domain models for ${featureName} management.` : `Simple feature for ${featureName} functionality.`}

## Structure

\`\`\`
${featureName}/
├── actions/       # Server Actions - Form handling, client requests
├── services/      # Business Logic - Orchestration, domain rules
├── data/          # Data Access - Pure database operations
${category === 'crud' ? '├── models/       # Domain Models - Business entities and rules\n' : ''}├── schemas/       # Zod Schemas - Input validation
├── components/    # React Components - UI elements
├── hooks/         # Custom Hooks - React state management
├── lib/           # Utilities - Errors, constants, helpers
├── types/         # TypeScript - Type definitions
└── __tests__/     # Tests - Unit and integration tests
\`\`\`

## Layer Responsibilities

### Actions (Server Actions)
${LAYER_DOCS.actions}

### Services (Business Logic)
${LAYER_DOCS.services}

### Data (Database Access)
${LAYER_DOCS.data}

${
  category === 'crud'
    ? `### Models (Domain Entities)
${LAYER_DOCS.models}
`
    : ''
}
### Schemas (Validation)
${LAYER_DOCS.schemas}

### Components (UI)
${LAYER_DOCS.components}

### Hooks (React)
${LAYER_DOCS.hooks}

### Lib (Utilities)
${LAYER_DOCS.lib}

## Guidelines

- **Never throw errors** from actions/services - use \`response.error()\`
- **Data layer returns \`null\`** on errors (with logging)
- **Always validate input** with Zod schemas
- **Use i18n keys** for all user-facing messages
- **Follow naming conventions**: kebab-case files, camelCase functions

See \`.github/prompts/feature-creation.prompt.md\` for complete guidelines.

## Usage

\`\`\`typescript
// Example: Create a ${featureName}
import { create${FeatureName} } from '@/features/${featureName}/actions';

const result = await create${FeatureName}({ name: 'Example' });

if (result.status === 'success') {
  console.log('Created:', result.data.id);
}
\`\`\`
`,
};

// Folder configurations by category
const folderConfigs: Record<
  FeatureCategory,
  {
    folders: string[];
    files: Record<string, (name: string, Name: string) => string>;
  }
> = {
  crud: {
    folders: [
      'actions',
      'services',
      'data',
      'models',
      'schemas',
      'components',
      'hooks',
      'lib',
      'types',
      '__tests__',
    ],
    files: {
      'lib/strings.ts': templates['lib/strings.ts'],
      'lib/errors.ts': templates['lib/errors.ts'],
      'lib/utils.ts': templates['lib/utils.ts'],
      'models/index.ts': templates['models/index.ts'],
      'actions/index.ts': templates['actions/index.ts'],
      'actions/create-example.ts': templates['actions/create-example.ts'],
      'services/index.ts': templates['services/index.ts'],
      'services/create-example.ts': templates['services/create-example.ts'],
      'data/example.ts': templates['data/example.ts'],
      'schemas/index.ts': templates['schemas/index.ts'],
      'schemas/create-example.ts': templates['schemas/create-example.ts'],
      'types/index.ts': templates['types/index.ts'],
      'hooks/index.ts': templates['hooks/index.ts'],
      'components/example.tsx': templates['components/example.tsx'],
      '__tests__/example.test.ts': templates['__tests__/example.test.ts'],
    },
  },
  simple: {
    folders: [
      'actions',
      'services',
      'data',
      'schemas',
      'components',
      'hooks',
      'lib',
      'types',
      '__tests__',
    ],
    files: {
      'lib/strings.ts': templates['lib/strings.ts'],
      'lib/errors.ts': templates['lib/errors.ts'],
      'actions/index.ts': templates['actions/index.ts'],
      'services/index.ts': templates['services/index.ts'],
      'data/example.ts': templates['data/example.ts'],
      'schemas/index.ts': templates['schemas/index.ts'],
      'types/index.ts': templates['types/index.ts'],
      'hooks/index.ts': templates['hooks/index.ts'],
      'components/example.tsx': templates['components/example.tsx'],
      '__tests__/example.test.ts': templates['__tests__/example.test.ts'],
    },
  },
};

async function createFeature(
  featureName: string,
  category: FeatureCategory = 'crud'
) {
  // Validate feature name
  if (!featureName || !/^[a-z][a-z0-9-]*$/.test(featureName)) {
    console.error('❌ Invalid feature name!');
    console.error('   Feature name must:');
    console.error('   - Start with a lowercase letter');
    console.error('   - Contain only lowercase letters, numbers, and hyphens');
    console.error('   - Use kebab-case (e.g., "user-settings")');
    process.exit(1);
  }

  const FeatureName = featureName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const config = folderConfigs[category];
  const basePath = join(process.cwd(), 'src', 'features', featureName);

  console.log(
    `\n📦 Creating ${category.toUpperCase()} feature: ${featureName}`
  );
  console.log(`📁 Location: ${basePath}\n`);

  try {
    // Create base feature folder
    await mkdir(basePath, { recursive: true });

    // Create subfolders
    for (const folder of config.folders) {
      const folderPath = join(basePath, folder);
      await mkdir(folderPath, { recursive: true });
      console.log(`✅ Created ${folder}/`);
    }

    // Create template files
    for (const [filePath, templateFn] of Object.entries(config.files)) {
      const fullPath = join(basePath, filePath);
      const content = templateFn(featureName, FeatureName);
      await writeFile(fullPath, content, 'utf-8');
      console.log(`✅ Created ${filePath}`);
    }

    // Create README
    const readmePath = join(basePath, 'README.md');
    const readmeContent = templates['README.md'](
      featureName,
      FeatureName,
      category
    );
    await writeFile(readmePath, readmeContent, 'utf-8');
    console.log(`✅ Created README.md`);

    // Create i18n locale files
    const locales = ['en', 'hu'];
    for (const locale of locales) {
      const localePath = join(
        process.cwd(),
        'src',
        'locales',
        locale,
        `${featureName}.json`
      );
      const localeContent = JSON.stringify(
        {
          [featureName]: {
            errors: {
              'not-found':
                locale === 'en'
                  ? `${FeatureName} not found`
                  : `${FeatureName} nem található`,
              'invalid-input':
                locale === 'en' ? 'Invalid input' : 'Érvénytelen bemenet',
            },
            success: {
              created:
                locale === 'en'
                  ? `${FeatureName} created successfully`
                  : `${FeatureName} sikeresen létrehozva`,
              updated:
                locale === 'en'
                  ? `${FeatureName} updated successfully`
                  : `${FeatureName} sikeresen frissítve`,
              deleted:
                locale === 'en'
                  ? `${FeatureName} deleted successfully`
                  : `${FeatureName} sikeresen törölve`,
            },
            labels: {
              title: locale === 'en' ? `${FeatureName}s` : `${FeatureName}ok`,
              'create-button':
                locale === 'en'
                  ? `Create ${FeatureName}`
                  : `${FeatureName} létrehozása`,
            },
          },
        },
        null,
        2
      );

      await mkdir(join(process.cwd(), 'src', 'locales', locale), {
        recursive: true,
      });
      await writeFile(localePath, localeContent, 'utf-8');
      console.log(`✅ Created locales/${locale}/${featureName}.json`);
    }

    console.log(
      `\n✨ ${category.toUpperCase()} feature "${featureName}" created successfully!\n`
    );
    console.log('📝 Next steps:');
    console.log('   1. Add Prisma schema:');
    console.log(`      - Add model ${FeatureName} to prisma/schema.prisma`);
    console.log(
      `      - Run: npx prisma migrate dev --name create-${featureName}`
    );
    console.log('');
    console.log('   2. Review and customize generated files:');
    if (category === 'crud') {
      console.log(`      - models/index.ts: Domain model with business logic`);
    }
    console.log(`      - data/example.ts: Database operations`);
    console.log(`      - services/create-example.ts: Business logic`);
    console.log(`      - actions/create-example.ts: Server action`);
    console.log('');
    console.log('   3. Add more translations with i18n scripts:');
    console.log(
      `      npm run i18n:add ${featureName}.errors.custom "Error text" "Hiba szöveg"`
    );
    console.log('');
    console.log('   4. Write tests in __tests__/');
    console.log('   5. Build UI components in components/');
    console.log('');
    console.log(
      `💡 See .github/prompts/feature-creation.prompt.md for detailed guides`
    );
    console.log(
      `📖 Feature documentation: src/features/${featureName}/README.md\n`
    );
  } catch (error) {
    console.error('❌ Error creating feature:', error);
    process.exit(1);
  }
}

// CLI execution
const featureName = process.argv[2];
const categoryArg = process.argv[3] as FeatureCategory | undefined;

if (!featureName) {
  console.error('❌ Feature name is required!');
  console.error('\nUsage:');
  console.error('  npm run feature:create <feature-name> [category]');
  console.error('\nCategories:');
  console.error(
    '  - crud (default): Full CRUD with models (posts, products, etc.)'
  );
  console.error(
    '  - simple: Lightweight features (settings, notifications, etc.)'
  );
  console.error('\nExamples:');
  console.error('  npm run feature:create posts');
  console.error('  npm run feature:create posts crud');
  console.error('  npm run feature:create settings simple');
  process.exit(1);
}

const category: FeatureCategory = categoryArg || 'crud';

if (!['crud', 'simple'].includes(category)) {
  console.error(`❌ Invalid category: ${category}`);
  console.error('   Valid categories: crud, simple');
  process.exit(1);
}

createFeature(featureName, category);
