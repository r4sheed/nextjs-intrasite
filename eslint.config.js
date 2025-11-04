import { defineConfig } from 'eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
      import: importPlugin,
      '@typescript-eslint': tseslint.plugin,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      // Next.js recommended + core web vitals
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // import sorting
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index'],
            ['type'],
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: '{next,next/**}', group: 'external', position: 'after' },
            { pattern: '@/lib/**', group: 'internal', position: 'before' },
            { pattern: '@/hooks/**', group: 'internal', position: 'before' },
            { pattern: '@/components/**', group: 'internal', position: 'after' },
            { pattern: '@/features/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['type'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
        },
      ],

      // TS cleanup
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Next-specific rule adjustments
      '@next/next/no-img-element': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'dist/**',
    ],
  },
]);
