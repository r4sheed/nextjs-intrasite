#!/usr/bin/env tsx
/**
 * Feature Scaffolding Script
 *
 * Creates a complete feature folder structure following project guidelines.
 *
 * Usage:
 *   npm run feature:create <feature-name>
 *
 * Example:
 *   npm run feature:create bookmarks
 *
 * This will create:
 *   src/features/bookmarks/
 *     ├── actions/
 *     │   └── index.ts
 *     ├── components/
 *     ├── data/
 *     ├── hooks/
 *     ├── lib/
 *     │   ├── errors.ts
 *     │   └── strings.ts
 *     ├── schemas/
 *     │   └── index.ts
 *     ├── services/
 *     │   └── index.ts
 *     ├── types/
 *     │   └── index.ts
 *     └── __tests__/
 *
 * @see .github/instructions/naming-conventions.instructions.md
 * @see .github/instructions/error-handling-guidelines.instructions.md
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Template content for each file
const templates = {
  'lib/strings.ts': (featureName: string, FeatureName: string) => `/**
 * ${FeatureName} feature string constants - Error codes, messages, and UI labels
 * Centralized location for all ${featureName}-related string constants and i18n keys
 *
 * @see .github/instructions/messages-and-codes.instructions.md
 */

/**
 * ${FeatureName} feature error codes
 * Format: kebab-case, URL-friendly
 * Used in AppError code field and URL parameters
 */
export const ${featureName.toUpperCase()}_CODES = {
  // Add your error codes here
  // Example: notFound: 'not-found',
} as const;

export type ${FeatureName}Code = (typeof ${featureName.toUpperCase()}_CODES)[keyof typeof ${featureName.toUpperCase()}_CODES];

/**
 * ${FeatureName} error messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * User-facing error messages shown in forms, toasts, or error pages
 */
export const ${featureName.toUpperCase()}_ERRORS = {
  // Add your error messages here
  // Example: notFound: '${featureName}.errors.not-found',
} as const;

/**
 * ${FeatureName} success messages (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * Confirmation messages for successful operations
 */
export const ${featureName.toUpperCase()}_SUCCESS = {
  // Add your success messages here
  // Example: created: '${featureName}.success.created',
} as const;

/**
 * ${FeatureName} UI labels (i18n keys)
 * TypeScript properties: camelCase
 * String values: kebab-case with dots
 * Static UI text: titles, labels, placeholders, buttons, links
 */
export const ${featureName.toUpperCase()}_LABELS = {
  // Add your UI labels here
  // Example: title: '${featureName}.labels.title',
} as const;
`,

  'lib/errors.ts': (
    featureName: string,
    FeatureName: string
  ) => `import { AppError } from '@/lib/errors';
import { HTTP_STATUS } from '@/lib/http-status';

import { ${featureName.toUpperCase()}_CODES, ${featureName.toUpperCase()}_ERRORS } from './strings';

/**
 * --- ${featureName.toUpperCase()} ERROR HELPERS ---
 * These functional helpers create feature-specific AppError instances.
 * They should be imported and used directly within ${featureName}-related Server Actions or Route Handlers.
 *
 * @see .github/instructions/error-handling-guidelines.instructions.md
 */

/**
 * Example: 404 - ${FeatureName} not found error
 * @param id - The ID of the ${featureName} that was not found
 * @returns AppError with status 404
 */
export const ${featureName}NotFound = (id: string) =>
  new AppError({
    code: ${featureName.toUpperCase()}_CODES.notFound,
    message: { key: ${featureName.toUpperCase()}_ERRORS.notFound, params: { id } },
    httpStatus: HTTP_STATUS.NOT_FOUND,
  });

// Add more error helpers as needed
`,

  'actions/index.ts': () => `/**
 * Barrel export for all server actions
 *
 * Export pattern: export { type XData, functionName } from './file-name'
 *
 * @see .github/instructions/naming-conventions.instructions.md
 */

// Example:
// export { type CreateBookmarkData, createBookmark } from './create-bookmark';
`,

  'services/index.ts': () => `/**
 * Barrel export for all service functions
 *
 * Export pattern: export { functionName } from './file-name'
 *
 * @see .github/instructions/naming-conventions.instructions.md
 */

// Example:
// export { createBookmark } from './create-bookmark';
`,

  'schemas/index.ts': () => `/**
 * Barrel export for all Zod schemas and their types
 *
 * Export pattern: export { schemaName, type SchemaType } from './file-name'
 */

// Example:
// export { createBookmarkSchema, type CreateBookmarkInput } from './create-bookmark';
`,

  'types/index.ts': (featureName: string, FeatureName: string) => `/**
 * ${FeatureName} feature type definitions
 *
 * Place shared types, interfaces, and type utilities here.
 * Keep types close to where they're used when possible.
 */

// Example:
// export type ${FeatureName} = {
//   id: string;
//   name: string;
//   createdAt: Date;
// };
`,

  'README.md': (
    featureName: string,
    FeatureName: string
  ) => `# ${FeatureName} Feature

## Overview

[Brief description of what this feature does]

## Structure

\`\`\`
${featureName}/
├── actions/       # Server Actions (Next.js)
├── components/    # React components
├── data/          # Database/data access layer
├── hooks/         # Custom React hooks
├── lib/           # Utility functions, errors, constants
├── schemas/       # Zod validation schemas
├── services/      # Business logic layer
├── types/         # TypeScript type definitions
└── __tests__/     # Unit and integration tests
\`\`\`

## Guidelines

- **Actions**: Always return \`Response<T>\`, never throw errors
- **Services**: Handle business logic, return \`Response<T>\`
- **Data**: Return \`null\` on errors, never throw
- **Naming**: kebab-case files, camelCase functions

See project guidelines in \`.github/instructions/\` for details.

## Usage

[Add usage examples here]
`,
};

// Folder structure to create
const folders = [
  'actions',
  'components',
  'data',
  'hooks',
  'lib',
  'schemas',
  'services',
  'types',
  '__tests__',
];

async function createFeature(featureName: string) {
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

  const basePath = join(process.cwd(), 'src', 'features', featureName);

  console.log(`\n📦 Creating feature: ${featureName}`);
  console.log(`📁 Location: ${basePath}\n`);

  try {
    // Create base feature folder
    await mkdir(basePath, { recursive: true });

    // Create subfolders
    for (const folder of folders) {
      const folderPath = join(basePath, folder);
      await mkdir(folderPath, { recursive: true });
      console.log(`✅ Created ${folder}/`);
    }

    // Create template files
    for (const [filePath, templateFn] of Object.entries(templates)) {
      const fullPath = join(basePath, filePath);
      const content = templateFn(featureName, FeatureName);
      await writeFile(fullPath, content, 'utf-8');
      console.log(`✅ Created ${filePath}`);
    }

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
              // 'not-found': `${FeatureName} not found`,
            },
            success: {
              // 'created': `${FeatureName} created successfully`,
            },
            labels: {
              // 'title': `${FeatureName}`,
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

    console.log(`\n✨ Feature "${featureName}" created successfully!\n`);
    console.log('📝 Next steps:');
    console.log(
      `   1. Update src/locales/en/${featureName}.json with translations`
    );
    console.log(`   2. Add error codes to lib/strings.ts`);
    console.log(`   3. Create your first action in actions/`);
    console.log(`   4. Add Zod schemas to schemas/`);
    console.log(`   5. Implement business logic in services/`);
    console.log(`   6. Add data access functions in data/`);
    console.log(`   7. Write tests in __tests__/\n`);
  } catch (error) {
    console.error('❌ Error creating feature:', error);
    process.exit(1);
  }
}

// CLI execution
const featureName = process.argv[2];

if (!featureName) {
  console.error('❌ Feature name is required!');
  console.error('\nUsage:');
  console.error('  npm run feature:create <feature-name>');
  console.error('\nExample:');
  console.error('  npm run feature:create bookmarks');
  process.exit(1);
}

createFeature(featureName);
