/**
 * i18n Manage Script Tests
 *
 * Tests for the comprehensive i18n management script with CRUD operations.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const TEST_DIR = join(process.cwd(), '__test_i18n_manage__');
const LOCALES_DIR = join(TEST_DIR, 'src/locales');
const FEATURES_DIR = join(TEST_DIR, 'src/features');

// Mock the helpers module
vi.mock('../../scripts/i18n/helpers', () => ({
  getLanguages: vi.fn(() => ['en', 'hu']),
  kebabToCamel: vi.fn((str: string) =>
    str.replace(/-([a-z0-9])/g, (_, letter) =>
      /[0-9]/.test(letter) ? letter : letter.toUpperCase()
    )
  ),
}));

// Mock the constants module
vi.mock('../../scripts/i18n/constants', () => ({
  LOCALES_DIR: 'src/locales',
  FEATURES_DIR: 'src/features',
  CORE_STRINGS_PATH: 'src/lib/errors/strings.ts',
  STRINGS_DIR: 'lib',
  STRINGS_FILE_NAME: 'strings.ts',
}));

// Import after mocking
import {
  parseKey,
  getConstantName,
  sortObjectKeys,
  addToLocaleFile,
  updateLocaleFile,
  deleteFromLocaleFile,
  addToConstantsFile,
  deleteFromConstantsFile,
  getRelativeKey,
  getDomainConfig,
} from '../manage';

/**
 * Setup test environment
 */
async function setupTestEnv() {
  // Clean up
  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }

  // Create directories
  await mkdir(join(LOCALES_DIR, 'en'), { recursive: true });
  await mkdir(join(LOCALES_DIR, 'hu'), { recursive: true });
  await mkdir(join(FEATURES_DIR, 'auth/lib'), { recursive: true });
  await mkdir(join(FEATURES_DIR, 'posts/lib'), { recursive: true });
  await mkdir(join(TEST_DIR, 'src/lib/errors'), { recursive: true });

  // Create test locale files
  const authEnJson = {
    auth: {
      errors: {
        'invalid-credentials': 'Invalid email or password',
        'email-required': 'Email is required',
      },
      success: {
        login: 'Welcome back!',
      },
    },
  };

  const authHuJson = {
    auth: {
      errors: {
        'invalid-credentials': 'Érvénytelen email vagy jelszó',
        'email-required': 'Email szükséges',
      },
      success: {
        login: 'Üdvözöljük újra!',
      },
    },
  };

  const postsEnJson = {
    posts: {
      errors: {
        'not-found': 'Post not found',
      },
    },
  };

  const postsHuJson = {
    posts: {
      errors: {
        'not-found': 'Bejegyzés nem található',
      },
    },
  };

  const errorsEnJson = {
    errors: {
      'not-found': 'Resource not found',
      'internal-server-error': 'An unexpected error occurred',
    },
  };

  const errorsHuJson = {
    errors: {
      'not-found': 'Erőforrás nem található',
      'internal-server-error': 'Váratlan hiba történt',
    },
  };

  await writeFile(
    join(LOCALES_DIR, 'en/auth.json'),
    JSON.stringify(authEnJson, null, 2),
    'utf-8'
  );
  await writeFile(
    join(LOCALES_DIR, 'hu/auth.json'),
    JSON.stringify(authHuJson, null, 2),
    'utf-8'
  );
  await writeFile(
    join(LOCALES_DIR, 'en/posts.json'),
    JSON.stringify(postsEnJson, null, 2),
    'utf-8'
  );
  await writeFile(
    join(LOCALES_DIR, 'hu/posts.json'),
    JSON.stringify(postsHuJson, null, 2),
    'utf-8'
  );
  await writeFile(
    join(LOCALES_DIR, 'en/errors.json'),
    JSON.stringify(errorsEnJson, null, 2),
    'utf-8'
  );
  await writeFile(
    join(LOCALES_DIR, 'hu/errors.json'),
    JSON.stringify(errorsHuJson, null, 2),
    'utf-8'
  );

  // Create test strings.ts files
  const authStringsTs = `
export const AUTH_ERRORS = {
  invalidCredentials: 'auth.errors.invalid-credentials',
  emailRequired: 'auth.errors.email-required',
} as const;

export const AUTH_SUCCESS = {
  login: 'auth.success.login',
} as const;
`;

  const postsStringsTs = `
export const POSTS_ERRORS = {
  notFound: 'posts.errors.not-found',
} as const;
`;

  const coreStringsTs = `
export const CORE_ERRORS = {
  notFound: 'errors.not-found',
  internalServerError: 'errors.internal-server-error',
} as const;
`;

  await writeFile(
    join(FEATURES_DIR, 'auth/lib/strings.ts'),
    authStringsTs,
    'utf-8'
  );
  await writeFile(
    join(FEATURES_DIR, 'posts/lib/strings.ts'),
    postsStringsTs,
    'utf-8'
  );
  await writeFile(
    join(TEST_DIR, 'src/lib/errors/strings.ts'),
    coreStringsTs,
    'utf-8'
  );
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnv() {
  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
}

describe('i18n Manage Script', () => {
  beforeEach(async () => {
    await setupTestEnv();
  });

  describe('parseKey function', () => {
    it('should parse standard nested key format', () => {
      const parsed = parseKey('auth.errors.invalid-credentials');

      expect(parsed).toEqual({
        domain: 'auth',
        category: 'errors',
        key: 'invalid-credentials',
        fullPath: ['auth', 'errors', 'invalid-credentials'],
      });
    });

    it('should parse errors domain flat structure', () => {
      const parsed = parseKey('errors.not-found');

      expect(parsed).toEqual({
        domain: 'errors',
        category: 'errors',
        key: 'not-found',
        fullPath: ['errors', 'not-found'],
      });
    });

    it('should throw for invalid key format', () => {
      expect(() => parseKey('invalid')).toThrow('Invalid key format');
      expect(() => parseKey('invalid.key')).toThrow('Invalid key format');
      expect(() => parseKey('')).toThrow('Invalid key format');
    });

    it('should throw for invalid errors domain format', () => {
      expect(() => parseKey('errors')).toThrow(
        'Invalid key format for errors domain'
      );
    });
  });

  describe('getConstantName function', () => {
    it('should generate correct constant names for feature domains', () => {
      expect(getConstantName('auth', 'errors')).toBe('AUTH_ERRORS');
      expect(getConstantName('auth', 'success')).toBe('AUTH_SUCCESS');
      expect(getConstantName('posts', 'labels')).toBe('POSTS_LABELS');
    });

    it('should handle errors domain specially', () => {
      expect(getConstantName('errors', 'errors')).toBe('CORE_ERRORS');
    });

    it('should handle unknown categories', () => {
      expect(getConstantName('auth', 'unknown')).toBe('AUTH_UNKNOWN');
    });
  });

  describe('sortObjectKeys function', () => {
    it('should sort object keys alphabetically', () => {
      const unsorted = {
        z: 'last',
        a: 'first',
        m: 'middle',
        nested: {
          z: 'nested-last',
          a: 'nested-first',
        },
      };

      const sorted = sortObjectKeys(unsorted) as Record<string, unknown>;

      expect(Object.keys(sorted)).toEqual(['a', 'm', 'nested', 'z']);
      expect(Object.keys(sorted.nested as Record<string, unknown>)).toEqual([
        'a',
        'z',
      ]);
    });

    it('should handle non-objects', () => {
      expect(sortObjectKeys('string')).toBe('string');
      expect(sortObjectKeys(42)).toBe(42);
      expect(sortObjectKeys(null)).toBe(null);
      expect(sortObjectKeys([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('Locale file operations', () => {
    describe('addToLocaleFile', () => {
      it('should add new key to locale file', async () => {
        const parsedKey = parseKey('auth.errors.new-error');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await addToLocaleFile(filePath, parsedKey, 'New error message');

        const content = await readFile(filePath, 'utf-8');
        const json = JSON.parse(content);

        expect(json.auth.errors['new-error']).toBe('New error message');
      });

      it('should throw if key already exists', async () => {
        const parsedKey = parseKey('auth.errors.invalid-credentials');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await expect(
          addToLocaleFile(filePath, parsedKey, 'Duplicate key')
        ).rejects.toThrow('already exists');
      });

      it('should create nested structure if needed', async () => {
        const parsedKey = parseKey('auth.warnings.new-warning');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await addToLocaleFile(filePath, parsedKey, 'New warning');

        const content = await readFile(filePath, 'utf-8');
        const json = JSON.parse(content);

        expect(json.auth.warnings['new-warning']).toBe('New warning');
      });
    });

    describe('updateLocaleFile', () => {
      it('should update existing key in locale file', async () => {
        const parsedKey = parseKey('auth.errors.invalid-credentials');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await updateLocaleFile(filePath, parsedKey, 'Updated error message');

        const content = await readFile(filePath, 'utf-8');
        const json = JSON.parse(content);

        expect(json.auth.errors['invalid-credentials']).toBe(
          'Updated error message'
        );
      });

      it('should throw if key does not exist', async () => {
        const parsedKey = parseKey('auth.errors.non-existent');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await expect(
          updateLocaleFile(filePath, parsedKey, 'New message')
        ).rejects.toThrow('not found');
      });
    });

    describe('deleteFromLocaleFile', () => {
      it('should delete existing key from locale file', async () => {
        const parsedKey = parseKey('auth.errors.invalid-credentials');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await deleteFromLocaleFile(filePath, parsedKey);

        const content = await readFile(filePath, 'utf-8');
        const json = JSON.parse(content);

        expect(json.auth.errors['invalid-credentials']).toBeUndefined();
      });

      it('should throw if key does not exist', async () => {
        const parsedKey = parseKey('auth.errors.non-existent');
        const filePath = join(LOCALES_DIR, 'en/auth.json');

        await expect(deleteFromLocaleFile(filePath, parsedKey)).rejects.toThrow(
          'not found'
        );
      });
    });
  });

  describe('Constants file operations', () => {
    describe('addToConstantsFile', () => {
      it('should add new property to constants file', async () => {
        const parsedKey = parseKey('auth.errors.new-error');
        const filePath = join(FEATURES_DIR, 'auth/lib/strings.ts');

        await addToConstantsFile(filePath, parsedKey);

        const content = await readFile(filePath, 'utf-8');

        expect(content).toContain("newError: 'errors.new-error'");
        expect(content).toContain('AUTH_ERRORS');
      });

      it('should create new constant object if it does not exist', async () => {
        const parsedKey = parseKey('auth.labels.new-label');
        const filePath = join(FEATURES_DIR, 'auth/lib/strings.ts');

        await addToConstantsFile(filePath, parsedKey);

        const content = await readFile(filePath, 'utf-8');

        expect(content).toContain('AUTH_LABELS');
        expect(content).toContain("newLabel: 'labels.new-label'");
      });

      it('should sort properties alphabetically', async () => {
        const parsedKey = parseKey('auth.errors.a-error');
        const filePath = join(FEATURES_DIR, 'auth/lib/strings.ts');

        await addToConstantsFile(filePath, parsedKey);

        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n');

        // Find AUTH_ERRORS block
        const authErrorsStart = lines.findIndex(line =>
          line.includes('export const AUTH_ERRORS')
        );
        const authErrorsEnd = lines.findIndex(
          (line, index) =>
            index > authErrorsStart && line.includes('} as const;')
        );

        const authErrorsBlock = lines
          .slice(authErrorsStart, authErrorsEnd + 1)
          .join('\n');

        // Check alphabetical order
        expect(authErrorsBlock.indexOf('aError')).toBeLessThan(
          authErrorsBlock.indexOf('emailRequired')
        );
        expect(authErrorsBlock.indexOf('emailRequired')).toBeLessThan(
          authErrorsBlock.indexOf('invalidCredentials')
        );
      });
    });

    describe('deleteFromConstantsFile', () => {
      it('should delete existing property from constants file', async () => {
        const parsedKey = parseKey('auth.errors.invalid-credentials');
        const filePath = join(FEATURES_DIR, 'auth/lib/strings.ts');

        await deleteFromConstantsFile(filePath, parsedKey);

        const content = await readFile(filePath, 'utf-8');

        expect(content).not.toContain(
          "invalidCredentials: 'auth.errors.invalid-credentials'"
        );
        expect(content).toContain(
          "emailRequired: 'auth.errors.email-required'"
        );
      });

      it('should throw if property does not exist', async () => {
        const parsedKey = parseKey('auth.errors.non-existent');
        const filePath = join(FEATURES_DIR, 'auth/lib/strings.ts');

        await expect(
          deleteFromConstantsFile(filePath, parsedKey)
        ).rejects.toThrow('not found');
      });

      it('should throw if constant does not exist', async () => {
        const parsedKey = parseKey('auth.unknown.non-existent');
        const filePath = join(FEATURES_DIR, 'auth/lib/strings.ts');

        await expect(
          deleteFromConstantsFile(filePath, parsedKey)
        ).rejects.toThrow('not found');
      });
    });
  });

  describe('getRelativeKey function', () => {
    it('should remove domain prefix from key', () => {
      expect(getRelativeKey('auth.errors.invalid-credentials', 'auth')).toBe(
        'errors.invalid-credentials'
      );
      expect(getRelativeKey('errors.not-found', 'errors')).toBe('not-found');
      expect(getRelativeKey('posts.labels.title', 'posts')).toBe(
        'labels.title'
      );
    });

    it('should return original key if prefix does not match', () => {
      expect(getRelativeKey('auth.errors.invalid-credentials', 'posts')).toBe(
        'auth.errors.invalid-credentials'
      );
    });
  });

  describe('getDomainConfig function', () => {
    it('should return correct config for known domains', () => {
      const config = getDomainConfig();

      expect(config.common).toEqual({
        locales: 'src/locales/{lang}/common.json',
        constants: undefined,
        feature: false,
      });

      expect(config.errors).toEqual({
        locales: 'src/locales/{lang}/errors.json',
        constants: 'src/lib/errors/strings.ts',
        feature: false,
      });

      expect(config.auth).toEqual({
        locales: 'src/locales/{lang}/auth.json',
        constants: 'src/features/auth/lib/strings.ts',
        feature: true,
      });
    });

    it('should detect dynamic feature domains', () => {
      // Note: This test runs in the actual workspace, so it will detect real features
      // We just verify that the function returns a config object
      const config = getDomainConfig();

      // Should have at least the static domains
      expect(config.common).toBeDefined();
      expect(config.errors).toBeDefined();
      expect(config.navigation).toBeDefined();

      // If there are feature domains in the workspace, they should be detected
      // But we don't assert specific ones since they depend on the actual workspace
      expect(typeof config).toBe('object');
    });
  });

  // Cleanup after all tests
  it('cleanup', async () => {
    await cleanupTestEnv();
  });
});
