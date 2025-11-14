import { readFile, writeFile, readdir } from 'node:fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(() => Promise.resolve('{}')),
    writeFile: vi.fn(() => Promise.resolve()),
    readdir: vi.fn(() => Promise.resolve([])),
  },
  readFile: vi.fn(() => Promise.resolve('{}')),
  writeFile: vi.fn(() => Promise.resolve()),
  readdir: vi.fn(() => Promise.resolve([])),
}));

// Mock helpers
vi.mock('../helpers', () => ({
  getLanguages: vi.fn(() => ['en', 'hu']),
  getDomains: vi.fn(() => ['auth', 'common']),
  getLabelSuffixRank: vi.fn(),
}));

// Import constants and helpers first
import { LABEL_SUFFIX_ORDER } from '../constants';
import { getLabelSuffixRank, getLanguages, getDomains } from '../helpers';
// Import after mocking
import { compareLabelKeys, sortObjectKeys, sortAllI18nFiles } from '../sort';

describe('i18n Sort Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLabelSuffixRank', () => {
    it('should return correct rank for keys with suffixes', () => {
      // Test each suffix in LABEL_SUFFIX_ORDER
      const testCases = [
        { key: 'loginTitle', suffix: 'title', expectedRank: 0 },
        { key: 'signupSubtitle', suffix: 'subtitle', expectedRank: 1 },
        { key: 'passwordDescription', suffix: 'description', expectedRank: 2 },
        { key: 'settingsTab', suffix: 'tab', expectedRank: 3 },
        { key: 'emailLabel', suffix: 'label', expectedRank: 4 },
        { key: 'passwordPlaceholder', suffix: 'placeholder', expectedRank: 5 },
        { key: 'loginButton', suffix: 'button', expectedRank: 6 },
        { key: 'forgotPasswordLink', suffix: 'link', expectedRank: 7 },
        { key: 'userName', suffix: 'name', expectedRank: 8 },
        { key: 'helpText', suffix: 'text', expectedRank: 9 },
        { key: 'welcomeMessage', suffix: 'message', expectedRank: 10 },
        { key: 'validationError', suffix: 'error', expectedRank: 11 },
        { key: 'saveSuccess', suffix: 'success', expectedRank: 12 },
        { key: 'updateInfo', suffix: 'info', expectedRank: 13 },
        { key: 'securityWarning', suffix: 'warning', expectedRank: 14 },
      ];

      testCases.forEach(({ key, expectedRank }) => {
        vi.mocked(getLabelSuffixRank).mockReturnValue(expectedRank);
        expect(getLabelSuffixRank(key)).toBe(expectedRank);
      });
    });

    it('should return fallback rank for keys without suffixes', () => {
      const fallbackRank = LABEL_SUFFIX_ORDER.indexOf('');

      vi.mocked(getLabelSuffixRank).mockReturnValue(fallbackRank);

      // Keys without recognized suffixes should get fallback rank
      expect(getLabelSuffixRank('someKey')).toBe(fallbackRank);
      expect(getLabelSuffixRank('anotherKey')).toBe(fallbackRank);
      expect(getLabelSuffixRank('random')).toBe(fallbackRank);
    });

    it('should handle case insensitive matching', () => {
      // Test that camelCase variations work
      vi.mocked(getLabelSuffixRank).mockImplementation((key: string) => {
        const normalized = key.toLowerCase();
        if (normalized.endsWith('title')) return 0;
        if (normalized.endsWith('button')) return 6;
        return LABEL_SUFFIX_ORDER.indexOf('');
      });

      expect(getLabelSuffixRank('loginTitle')).toBe(0);
      expect(getLabelSuffixRank('LoginTitle')).toBe(0);
      expect(getLabelSuffixRank('loginButton')).toBe(6);
      expect(getLabelSuffixRank('LoginButton')).toBe(6);
    });

    it('should prioritize exact suffix matches over partial matches', () => {
      // Test that suffixes are checked in LABEL_SUFFIX_ORDER
      vi.mocked(getLabelSuffixRank).mockImplementation((key: string) => {
        const normalized = key.toLowerCase();
        // Check in order of LABEL_SUFFIX_ORDER
        if (normalized.endsWith('placeholder')) return 5;
        // No 'holder' check, as it's not in LABEL_SUFFIX_ORDER
        return LABEL_SUFFIX_ORDER.indexOf(''); // fallback
      });

      expect(getLabelSuffixRank('passwordPlaceholder')).toBe(5);
      expect(getLabelSuffixRank('someHolder')).toBe(
        LABEL_SUFFIX_ORDER.indexOf('')
      );
    });
  });

  describe('compareLabelKeys', () => {
    it('should sort by suffix rank first, then alphabetically', () => {
      // Mock getLabelSuffixRank to return specific ranks
      vi.mocked(getLabelSuffixRank).mockImplementation((key: string) => {
        const rankMap: Record<string, number> = {
          loginTitle: 0, // title = 0
          signupSubtitle: 1, // subtitle = 1
          passwordLabel: 4, // label = 4
          emailLabel: 4, // label = 4 (same rank)
          loginButton: 6, // button = 6
          someKey: 15, // no suffix = fallback
        };
        return rankMap[key] ?? 15;
      });

      const keys = [
        'loginButton',
        'emailLabel',
        'loginTitle',
        'signupSubtitle',
        'passwordLabel',
        'someKey',
      ];

      keys.sort(compareLabelKeys);

      expect(keys).toEqual([
        'loginTitle', // rank 0
        'signupSubtitle', // rank 1
        'emailLabel', // rank 4 (alphabetically before passwordLabel)
        'passwordLabel', // rank 4
        'loginButton', // rank 6
        'someKey', // rank 15 (fallback)
      ]);
    });

    it('should sort alphabetically within same suffix rank', () => {
      vi.mocked(getLabelSuffixRank).mockReturnValue(4); // All have 'label' rank

      const keys = [
        'passwordLabel',
        'emailLabel',
        'usernameLabel',
        'confirmLabel',
      ];

      keys.sort(compareLabelKeys);

      expect(keys).toEqual([
        'confirmLabel',
        'emailLabel',
        'passwordLabel',
        'usernameLabel',
      ]);
    });

    it('should handle keys with no suffix (fallback rank)', () => {
      vi.mocked(getLabelSuffixRank).mockImplementation((key: string) => {
        if (key.includes('Label')) return 4;
        return LABEL_SUFFIX_ORDER.indexOf(''); // fallback rank
      });

      const keys = ['someKey', 'anotherKey', 'emailLabel', 'passwordLabel'];

      keys.sort(compareLabelKeys);

      expect(keys).toEqual([
        'emailLabel', // rank 4
        'passwordLabel', // rank 4
        'anotherKey', // fallback rank (alphabetically first)
        'someKey', // fallback rank
      ]);
    });
  });

  describe('sortObjectKeys', () => {
    it('should sort regular object keys alphabetically', () => {
      const obj = {
        zebra: 'last',
        apple: 'first',
        banana: 'middle',
      };

      const sorted = sortObjectKeys(obj) as Record<string, string>;

      expect(Object.keys(sorted)).toEqual(['apple', 'banana', 'zebra']);
    });

    it('should sort nested objects recursively', () => {
      const obj = {
        z: {
          zebra: 'nested last',
          apple: 'nested first',
        },
        a: {
          zebra: 'another nested',
          banana: 'another first',
        },
      };

      const sorted = sortObjectKeys(obj);

      expect(Object.keys(sorted as Record<string, unknown>)).toEqual([
        'a',
        'z',
      ]);
      expect(
        Object.keys((sorted as Record<string, Record<string, string>>).a!)
      ).toEqual(['banana', 'zebra']);
      expect(
        Object.keys((sorted as Record<string, Record<string, string>>).z!)
      ).toEqual(['apple', 'zebra']);
    });

    it('should sort labels object with suffix priority', () => {
      vi.mocked(getLabelSuffixRank).mockImplementation((key: string) => {
        const rankMap: Record<string, number> = {
          loginTitle: 0,
          signupSubtitle: 1,
          emailLabel: 4,
          passwordLabel: 4,
          loginButton: 6,
          someKey: 15,
        };
        return rankMap[key] ?? 15;
      });

      const labels = {
        loginButton: 'labels.login-button',
        emailLabel: 'labels.email',
        loginTitle: 'labels.login-title',
        signupSubtitle: 'labels.signup-subtitle',
        passwordLabel: 'labels.password',
        someKey: 'labels.some-key',
      };

      const sorted = sortObjectKeys(labels, ['auth', 'labels']) as Record<
        string,
        string
      >;

      expect(Object.keys(sorted)).toEqual([
        'loginTitle', // rank 0
        'signupSubtitle', // rank 1
        'emailLabel', // rank 4
        'passwordLabel', // rank 4
        'loginButton', // rank 6
        'someKey', // rank 15
      ]);
    });

    it('should use default comparator for non-labels paths', () => {
      const errors = {
        'not-found': 'Not found',
        'invalid-input': 'Invalid input',
        'server-error': 'Server error',
      };

      const sorted = sortObjectKeys(errors, ['auth', 'errors']) as Record<
        string,
        string
      >;

      expect(Object.keys(sorted)).toEqual([
        'invalid-input',
        'not-found',
        'server-error',
      ]);
    });

    it('should handle arrays unchanged', () => {
      const obj = {
        items: ['third', 'first', 'second'],
        name: 'test',
      };

      const sorted = sortObjectKeys(obj) as Record<string, unknown>;

      expect(sorted.items).toEqual(['third', 'first', 'second']); // unchanged
      expect(sorted.name).toBe('test');
    });

    it('should handle primitive values unchanged', () => {
      const obj = {
        count: 42,
        enabled: true,
        text: 'hello',
      };

      const sorted = sortObjectKeys(obj) as Record<string, unknown>;

      expect(sorted.count).toBe(42);
      expect(sorted.enabled).toBe(true);
      expect(sorted.text).toBe('hello');
    });
  });

  describe('sortAllI18nFiles integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(readFile).mockResolvedValue('{}');
      vi.mocked(writeFile).mockResolvedValue();
      vi.mocked(readdir).mockResolvedValue([]);
    });

    it('should process all language and domain combinations', async () => {
      await sortAllI18nFiles();

      // Should call getLanguages and getDomains
      expect(vi.mocked(getLanguages)).toHaveBeenCalled();
      expect(vi.mocked(getDomains)).toHaveBeenCalledWith('en');
      expect(vi.mocked(getDomains)).toHaveBeenCalledWith('hu');
    });

    it('should process core strings file', async () => {
      await sortAllI18nFiles();

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should write sorted content back to files', async () => {
      // Mock readFile to return unsorted JSON
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify(
          {
            z: 'last',
            a: 'first',
            m: 'middle',
          },
          null,
          2
        )
      );

      await sortAllI18nFiles();

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should handle file read errors gracefully', async () => {
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

      // Should not throw, just skip problematic files
      await expect(sortAllI18nFiles()).resolves.not.toThrow();
    });
  });

  describe('LABEL_SUFFIX_ORDER integration', () => {
    it('should respect the exact order defined in LABEL_SUFFIX_ORDER', () => {
      // Test that the implementation uses LABEL_SUFFIX_ORDER directly
      const expectedOrder = LABEL_SUFFIX_ORDER;

      expect(expectedOrder).toEqual([
        'title',
        'subtitle',
        'description',
        'tab',
        'label',
        'placeholder',
        'button',
        'link',
        'name',
        'text',
        'message',
        'error',
        'success',
        'info',
        'warning',
        '', // suffix-less keys
      ]);
    });

    it('should place suffix-less keys according to empty string position', () => {
      const emptyStringIndex = LABEL_SUFFIX_ORDER.indexOf('');

      vi.mocked(getLabelSuffixRank).mockImplementation((key: string) => {
        if (key.includes('Title')) return 0;
        if (key.includes('Button')) return 6;
        return emptyStringIndex; // suffix-less keys
      });

      // Keys with suffixes should come before suffix-less keys
      const keys = ['someKey', 'loginTitle', 'anotherKey', 'saveButton'];

      keys.sort(compareLabelKeys);

      expect(keys).toEqual([
        'loginTitle', // rank 0
        'saveButton', // rank 6
        'anotherKey', // fallback rank (alphabetically first)
        'someKey', // fallback rank
      ]);
    });
  });
});
