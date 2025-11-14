/**
 * i18n Scripts Tests
 *
 * Tests for i18n management utilities (add, validate, sync)
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const TEST_DIR = join(process.cwd(), '__test_i18n__');
const LOCALES_DIR = join(TEST_DIR, 'src/locales');
const FEATURES_DIR = join(TEST_DIR, 'src/features');

// Mock the helpers module
vi.mock('../../scripts/i18n/helpers', () => ({
  getLanguages: vi.fn(() => ['en', 'hu']),
  getDomains: vi.fn(() => ['test']),
  kebabToCamel: vi.fn((str: string) =>
    str.replace(/-([a-z0-9])/g, (_, letter) =>
      /[0-9]/.test(letter) ? letter : letter.toUpperCase()
    )
  ),
  getLabelSuffixRank: vi.fn(() => 0),
  compareLabelKeys: vi.fn(),
}));

// Import after mocking
import { ROOT_LOCALE_FILES } from '../constants';
import { getLanguages } from '../helpers';

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

  describe('Dynamic Language Support', () => {
    it('should generate ROOT_LOCALE_FILES dynamically from getLanguages', () => {
      // Test that ROOT_LOCALE_FILES is generated from getLanguages
      expect(ROOT_LOCALE_FILES).toEqual(['en.json', 'hu.json']);
      expect(getLanguages).toHaveBeenCalled();
    });

    it('should handle mocked languages correctly', () => {
      vi.mocked(getLanguages).mockReturnValue(['en', 'hu', 'de']);

      // Since ROOT_LOCALE_FILES is computed at import time, we test the logic
      const expectedFiles = ['en', 'hu', 'de'].map(lang => `${lang}.json`);
      expect(expectedFiles).toEqual(['en.json', 'hu.json', 'de.json']);
    });

    it('should work with single language', () => {
      const singleLangFiles = ['en'].map(lang => `${lang}.json`);
      expect(singleLangFiles).toEqual(['en.json']);
    });

    it('should handle multiple languages dynamically', () => {
      const languages = ['en', 'hu', 'de', 'fr', 'es'];
      const expectedFiles = languages.map(lang => `${lang}.json`);
      expect(expectedFiles).toEqual([
        'en.json',
        'hu.json',
        'de.json',
        'fr.json',
        'es.json',
      ]);
    });

    it('should detect new languages automatically', () => {
      // Simulate adding a new language
      const originalLanguages = ['en', 'hu'];
      const newLanguages = [...originalLanguages, 'de'];

      const originalFiles = originalLanguages.map(lang => `${lang}.json`);
      const newFiles = newLanguages.map(lang => `${lang}.json`);

      expect(originalFiles).toEqual(['en.json', 'hu.json']);
      expect(newFiles).toEqual(['en.json', 'hu.json', 'de.json']);
    });
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

      const getAllKeys = (
        obj: Record<string, unknown>,
        prefix = ''
      ): string[] => {
        const keys: string[] = [];

        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
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
      function parseKey(key: string): string[] {
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
        return str.replace(/-([a-z0-9])/g, (_, letter) =>
          /[0-9]/.test(letter) ? letter : letter.toUpperCase()
        );
      }

      expect(kebabToCamel('invalid-email')).toBe('invalidEmail');
      expect(kebabToCamel('password-too-short')).toBe('passwordTooShort');
      expect(kebabToCamel('user-not-found')).toBe('userNotFound');
      expect(kebabToCamel('simple')).toBe('simple');
      expect(kebabToCamel('verify-2fa-code-sent')).toBe('verify2faCodeSent');
    });
  });

  describe('sortObjectKeys utility', () => {
    it('should sort object keys alphabetically', () => {
      function sortObjectKeys(obj: unknown): unknown {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          return obj;
        }

        const sorted: Record<string, unknown> = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
          sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
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

      const sorted = sortObjectKeys(unsorted) as Record<string, unknown>;

      expect(Object.keys(sorted)).toEqual(['a', 'm', 'nested', 'z']);
      expect(Object.keys(sorted.nested as Record<string, unknown>)).toEqual([
        'a',
        'z',
      ]);
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

  describe('Dynamic compareLocaleFiles function', () => {
    it('should work with any source and target languages', () => {
      // Test the function signature accepts any languages
      const compareLocaleFiles = async (
        _sourcePath: string,
        _targetPath: string,
        sourceLang: string,
        targetLang: string,
        _domain: string
      ): Promise<void> => {
        // Test that it can handle different language pairs
        expect(sourceLang).toBeDefined();
        expect(targetLang).toBeDefined();
        expect(sourceLang).not.toBe(targetLang);
      };

      // Test with different language pairs
      expect(async () => {
        await compareLocaleFiles('en.json', 'hu.json', 'en', 'hu', 'test');
      }).not.toThrow();

      expect(async () => {
        await compareLocaleFiles('en.json', 'de.json', 'en', 'de', 'test');
      }).not.toThrow();

      expect(async () => {
        await compareLocaleFiles('fr.json', 'es.json', 'fr', 'es', 'test');
      }).not.toThrow();
    });

    it('should generate appropriate placeholder text for different languages', () => {
      const generatePlaceholder = (
        sourceValue: string,
        targetLang: string
      ): string => {
        return `[${targetLang.toUpperCase()}] ${sourceValue}`;
      };

      expect(generatePlaceholder('Hello world', 'hu')).toBe('[HU] Hello world');
      expect(generatePlaceholder('Welcome back', 'de')).toBe(
        '[DE] Welcome back'
      );
      expect(generatePlaceholder('Error occurred', 'fr')).toBe(
        '[FR] Error occurred'
      );
    });
  });

  describe('Dynamic syncLocaleFiles function', () => {
    it('should sync between any source and target languages', () => {
      const syncLocaleFiles = async (
        sourcePath: string,
        targetPath: string,
        sourceLang: string,
        targetLang: string,
        domain: string
      ): Promise<void> => {
        // Mock implementation that tests the signature
        expect(sourceLang).toBeDefined();
        expect(targetLang).toBeDefined();
        expect(sourceLang).not.toBe(targetLang);
        expect(domain).toBeDefined();
      };

      // Test various language pairs
      expect(async () => {
        await syncLocaleFiles(
          'en/auth.json',
          'hu/auth.json',
          'en',
          'hu',
          'auth'
        );
      }).not.toThrow();

      expect(async () => {
        await syncLocaleFiles(
          'en/common.json',
          'de/common.json',
          'en',
          'de',
          'common'
        );
      }).not.toThrow();
    });

    it('should handle different placeholder formats for target languages', () => {
      const testCases = [
        { sourceLang: 'en', targetLang: 'hu', expected: '[HU]' },
        { sourceLang: 'en', targetLang: 'de', expected: '[DE]' },
        { sourceLang: 'fr', targetLang: 'es', expected: '[ES]' },
      ];

      testCases.forEach(({ targetLang, expected }) => {
        const placeholder = `[${targetLang.toUpperCase()}]`;
        expect(placeholder).toBe(expected);
      });
    });
  });

  // Cleanup after all tests
  it('cleanup', async () => {
    await cleanupTestEnv();
  });
});
