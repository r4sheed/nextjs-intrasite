#!/usr/bin/env tsx
/**
 * i18n Merge Script
 *
 * Merges all domain-specific JSON files into single locale files:
 * - {LOCALES_DIR}/en/*.json → {LOCALES_DIR}/en.json
 * - {LOCALES_DIR}/hu/*.json → {LOCALES_DIR}/hu.json
 *
 * Usage:
 *   npm run i18n:merge
 */
import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { LOCALES_DIR } from './constants';
import { getLanguages } from './helpers';
import { sortObjectKeys } from './sort';

/**
 * Merge all JSON files in a locale directory into a single file
 */
async function mergeLocaleFiles(locale: string): Promise<void> {
  const localeDir = join(process.cwd(), LOCALES_DIR, locale);
  const outputFile = join(process.cwd(), LOCALES_DIR, `${locale}.json`);

  if (!existsSync(localeDir)) {
    console.log(`⚠️  Locale directory not found: ${localeDir} (skipped)`);
    return;
  }

  const files = readdirSync(localeDir)
    .filter(file => file.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.log(`⚠️  No JSON files found in: ${localeDir} (skipped)`);
    return;
  }

  console.log(`📦 Merging ${files.length} files for locale: ${locale}`);

  const merged: Record<string, unknown> = {};

  for (const file of files) {
    const filePath = join(localeDir, file);
    const content = await readFile(filePath, 'utf-8');

    try {
      const json = JSON.parse(content);
      Object.assign(merged, json);
      console.log(`  ✅ Merged: ${file}`);
    } catch (error) {
      console.error(`  ❌ Failed to parse: ${file} - ${error}`);
      throw error;
    }
  }

  // Sort keys alphabetically for consistency
  const sorted = sortObjectKeys(merged);

  // Write merged file
  await writeFile(outputFile, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`✨ Created: ${outputFile}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Starting i18n merge process...\n');

  try {
    const languages = getLanguages();

    for (const locale of languages) {
      await mergeLocaleFiles(locale);
    }

    console.log('🎉 i18n merge completed successfully!');
    console.log(
      '\n📝 Note: Domain-specific files are still available for editing.'
    );
    console.log('   The merged files are used by next-intl at runtime.');
  } catch (error) {
    console.error(
      '\n❌ Error during merge:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

main();
