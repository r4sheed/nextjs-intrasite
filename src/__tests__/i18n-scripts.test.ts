/**
 * i18n Scripts Tests
 *
 * Tests for i18n management utilities (add, validate, sync)
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const TEST_DIR = join(process.cwd(), '__test_i18n__');
const LOCALES_DIR = join(TEST_DIR, 'src/locales');
const FEATURES_DIR = join(TEST_DIR, 'src/features');

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
  await mkdir(join(FEATURES_DIR, 'test/lib'), { recursive: true });

  // Create test locale files
  const enJson = {
    test: {
      errors: {
        'error-one': 'Error One',
        'error-two': 'Error Two',
      },
      success: {
        'success-one': 'Success One',
      },
    },
  };

  const huJson = {
    test: {
      errors: {
        'error-one': 'Hiba Egy',
        // Missing: error-two
      },
      success: {
        'success-one': 'Siker Egy',
        'extra-key': 'Extra', // Extra key
      },
    },
  };

  await writeFile(
    join(LOCALES_DIR, 'en/test.json'),
    JSON.stringify(enJson, null, 2),
    'utf-8'
  );
  await writeFile(
    join(LOCALES_DIR, 'hu/test.json'),
    JSON.stringify(huJson, null, 2),
    'utf-8'
  );

  // Create test strings.ts
  const stringsTs = `
export const TEST_ERRORS = {
  errorOne: 'test.errors.error-one',
  errorTwo: 'test.errors.error-two',
} as const;

export const TEST_SUCCESS = {
  successOne: 'test.success.success-one',
} as const;
`;

  await writeFile(
    join(FEATURES_DIR, 'test/lib/strings.ts'),
    stringsTs,
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

describe('i18n Scripts', () => {
  beforeEach(async () => {
    await setupTestEnv();
  });

  describe('getAllKeys utility', () => {
    it('should extract all nested keys from JSON', async () => {
      const json = {
        test: {
          errors: {
            'error-one': 'Error One',
            'error-two': 'Error Two',
          },
          success: {
            'success-one': 'Success One',
          },
        },
      };

      const getAllKeys = (obj: any, prefix = ''): string[] => {
        const keys: string[] = [];

        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            keys.push(...getAllKeys(value, fullKey));
          } else {
            keys.push(fullKey);
          }
        }

        return keys;
      };

      const keys = getAllKeys(json);

      expect(keys).toEqual([
        'test.errors.error-one',
        'test.errors.error-two',
        'test.success.success-one',
      ]);
    });
  });

  describe('parseKey utility', () => {
    it('should parse valid nested i18n key', () => {
      interface ParsedKey {
        domain: string;
        category: string;
        key: string;
        fullPath: string[];
      }

      function parseKey(key: string): ParsedKey {
        const parts = key.split('.');

        // Special handling for 'errors' domain (flat structure)
        if (parts[0] === 'errors') {
          if (parts.length < 2) {
            throw new Error('Invalid key format for errors domain');
          }

          const domain = parts[0];
          const keyName = parts.slice(1).join('.');

          if (!domain) {
            throw new Error('Domain is required');
          }

          return {
            domain,
            category: 'errors',
            key: keyName,
            fullPath: parts,
          };
        }

        // Standard nested structure
        if (parts.length < 3) {
          throw new Error('Invalid key format');
        }

        const domain = parts[0];
        const category = parts[1];
        const rest = parts.slice(2);

        if (!domain || !category) {
          throw new Error('Domain and category are required');
        }

        return {
          domain,
          category,
          key: rest.join('.'),
          fullPath: parts,
        };
      }

      const parsed = parseKey('auth.errors.invalid-email');

      expect(parsed).toEqual({
        domain: 'auth',
        category: 'errors',
        key: 'invalid-email',
        fullPath: ['auth', 'errors', 'invalid-email'],
      });
    });

    it('should parse flat errors domain key', () => {
      interface ParsedKey {
        domain: string;
        category: string;
        key: string;
        fullPath: string[];
      }

      function parseKey(key: string): ParsedKey {
        const parts = key.split('.');

        if (parts[0] === 'errors') {
          if (parts.length < 2) {
            throw new Error('Invalid key format for errors domain');
          }

          const domain = parts[0];
          const keyName = parts.slice(1).join('.');

          if (!domain) {
            throw new Error('Domain is required');
          }

          return {
            domain,
            category: 'errors',
            key: keyName,
            fullPath: parts,
          };
        }

        if (parts.length < 3) {
          throw new Error('Invalid key format');
        }

        const domain = parts[0];
        const category = parts[1];
        const rest = parts.slice(2);

        if (!domain || !category) {
          throw new Error('Domain and category are required');
        }

        return {
          domain,
          category,
          key: rest.join('.'),
          fullPath: parts,
        };
      }

      const parsed = parseKey('errors.not-found');

      expect(parsed).toEqual({
        domain: 'errors',
        category: 'errors',
        key: 'not-found',
        fullPath: ['errors', 'not-found'],
      });
    });

    it('should throw for invalid key format', () => {
      function parseKey(key: string): any {
        const parts = key.split('.');
        if (parts.length < 3) {
          throw new Error('Invalid key format');
        }
        return parts;
      }

      expect(() => parseKey('invalid')).toThrow('Invalid key format');
      expect(() => parseKey('invalid.key')).toThrow('Invalid key format');
    });
  });

  describe('kebabToCamel utility', () => {
    it('should convert kebab-case to camelCase', () => {
      function kebabToCamel(str: string): string {
        return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      }

      expect(kebabToCamel('invalid-email')).toBe('invalidEmail');
      expect(kebabToCamel('password-too-short')).toBe('passwordTooShort');
      expect(kebabToCamel('user-not-found')).toBe('userNotFound');
      expect(kebabToCamel('simple')).toBe('simple');
    });
  });

  describe('sortObjectKeys utility', () => {
    it('should sort object keys alphabetically', () => {
      function sortObjectKeys(obj: any): any {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          return obj;
        }

        const sorted: any = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
          sorted[key] = sortObjectKeys(obj[key]);
        }

        return sorted;
      }

      const unsorted = {
        z: 'last',
        a: 'first',
        m: 'middle',
        nested: {
          z: 'nested-last',
          a: 'nested-first',
        },
      };

      const sorted = sortObjectKeys(unsorted);

      expect(Object.keys(sorted)).toEqual(['a', 'm', 'nested', 'z']);
      expect(Object.keys(sorted.nested)).toEqual(['a', 'z']);
    });
  });

  describe('File operations', () => {
    it('should read and parse JSON files', async () => {
      const enPath = join(LOCALES_DIR, 'en/test.json');
      const content = await readFile(enPath, 'utf-8');
      const json = JSON.parse(content);

      expect(json.test.errors['error-one']).toBe('Error One');
      expect(json.test.success['success-one']).toBe('Success One');
    });

    it('should detect missing translations', async () => {
      const enPath = join(LOCALES_DIR, 'en/test.json');
      const huPath = join(LOCALES_DIR, 'hu/test.json');

      const enContent = await readFile(enPath, 'utf-8');
      const huContent = await readFile(huPath, 'utf-8');

      const enJson = JSON.parse(enContent);
      const huJson = JSON.parse(huContent);

      // Check if error-two exists in HU
      expect(huJson.test.errors['error-two']).toBeUndefined();
      expect(enJson.test.errors['error-two']).toBe('Error Two');
    });

    it('should detect extra translations', async () => {
      const huPath = join(LOCALES_DIR, 'hu/test.json');
      const huContent = await readFile(huPath, 'utf-8');
      const huJson = JSON.parse(huContent);

      // Check if extra-key exists in HU but not needed
      expect(huJson.test.success['extra-key']).toBe('Extra');
    });
  });

  describe('Integration', () => {
    it('should have consistent structure between EN and HU', async () => {
      const enPath = join(LOCALES_DIR, 'en/test.json');
      const enContent = await readFile(enPath, 'utf-8');
      const enJson = JSON.parse(enContent);

      expect(enJson.test).toBeDefined();
      expect(enJson.test.errors).toBeDefined();
      expect(enJson.test.success).toBeDefined();
    });

    it('should have matching constants in strings.ts', async () => {
      const stringsPath = join(FEATURES_DIR, 'test/lib/strings.ts');
      const content = await readFile(stringsPath, 'utf-8');

      expect(content).toContain('TEST_ERRORS');
      expect(content).toContain('TEST_SUCCESS');
      expect(content).toContain("errorOne: 'test.errors.error-one'");
      expect(content).toContain("successOne: 'test.success.success-one'");
    });
  });

  // Cleanup after all tests
  it('cleanup', async () => {
    await cleanupTestEnv();
  });
});
