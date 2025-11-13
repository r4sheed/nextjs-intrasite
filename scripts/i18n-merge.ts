#!/usr/bin/env tsx
/**
 * i18n Merge Script
 *
 * Merges all domain-specific JSON files into single locale files:
 * - src/locales/en/*.json → src/locales/en.json
 * - src/locales/hu/*.json → src/locales/hu.json
 *
 * Usage:
 *   npm run i18n:merge
 */
import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const LOCALES_DIR = 'src/locales';
const LOCALES = ['en', 'hu'] as const;

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
 * Sort object keys alphabetically (recursive)
 */
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

/**
 * Main function
 */
async function main() {
  console.log('🔄 Starting i18n merge process...\n');

  try {
    for (const locale of LOCALES) {
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
