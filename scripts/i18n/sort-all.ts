#!/usr/bin/env tsx
/**
 * i18n Sort All Script
 *
 * Sorts both JSON locale files and TypeScript strings constants files:
 * - JSON files: sorted by suffix rank (for labels), then alphabetically
 * - TS strings: sorted by suffix rank (for labels), then alphabetically, with blank lines between groups
 * - Removes old comments from constants (keeps structure clean)
 *
 * Usage:
 *   npm run i18n:sort-all
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  LOCALES_DIR,
  FEATURES_DIR,
  ROOT_LOCALE_FILES,
  CORE_STRINGS_PATH,
} from './constants';
import { getLanguages, getDomains, getLabelSuffixRank } from './helpers';
import { sortObjectKeys, compareLabelKeys } from './sort';

function addLabelGroupSeparators(lines: string[]): string[] {
  const result: string[] = [];
  let prevRank: number | null = null;

  // Count items per group
  const groupCounts = new Map<number, number>();
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Za-z0-9_]+):/);
    if (match) {
      const rank = getLabelSuffixRank(match[1]!);
      groupCounts.set(rank, (groupCounts.get(rank) || 0) + 1);
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Za-z0-9_]+):/);
    if (match) {
      const rank = getLabelSuffixRank(match[1]!);
      if (
        prevRank !== null &&
        rank !== prevRank &&
        (groupCounts.get(rank) || 0) > 1
      ) {
        result.push('');
      }
      prevRank = rank;
    }
    result.push(line);
  }

  return result;
}

async function sortStringsFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  let updatedContent = content;
  let changed = false;

  // Match constant blocks: export const NAME = { ... } as const;
  const constantRegex = /export const ([A-Z_]+) = \{([\s\S]*?)\} as const;/g;
  let match;

  while ((match = constantRegex.exec(content)) !== null) {
    const constantName = match[1]!;
    const body = match[2]!;

    // Split body into lines
    const lines = body.split(/\r?\n/);

    // Extract key-value lines (skip comments)
    const keyLines: Array<{ key: string; line: string }> = [];

    let index = 0;
    while (index < lines.length) {
      const line = lines[index]!;
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//')) {
        index++;
        continue;
      }

      // Single-line: key: 'value',
      const singleLineMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*'([^']+)',?$/);
      if (singleLineMatch) {
        const key = singleLineMatch[1]!;
        keyLines.push({ key, line });
        index++;
        continue;
      }

      // Multi-line: key:
      //   'value',
      const multiLineKeyMatch = trimmed.match(/^([A-Za-z0-9_]+):$/);
      if (multiLineKeyMatch && index + 1 < lines.length) {
        const nextLine = lines[index + 1]!;
        const nextTrimmed = nextLine.trim();
        const multiLineValueMatch = nextTrimmed.match(/^'([^']+)',?$/);
        if (multiLineValueMatch) {
          const key = multiLineKeyMatch[1]!;
          keyLines.push({ key, line: line + '\n' + nextLine });
          index += 2;
          continue;
        }
      }

      index++;
    }

    // Sort keys
    const isLabels = constantName.endsWith('_LABELS');
    const comparator = isLabels
      ? compareLabelKeys
      : (a: string, b: string) => a.localeCompare(b);

    keyLines.sort((a, b) => comparator(a.key, b.key));

    // Rebuild lines
    let newLines = keyLines.map(item => item.line);

    // Add separators for labels
    if (isLabels) {
      newLines = addLabelGroupSeparators(newLines);
    }

    // Replace in content
    const oldBlock = `export const ${constantName} = {${body}} as const;`;
    const newBlock = `export const ${constantName} = {\n${newLines.join('\n')}\n} as const;`;

    if (oldBlock !== newBlock) {
      updatedContent = updatedContent.replace(oldBlock, newBlock);
      changed = true;
    }
  }

  if (changed) {
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(`   ✅ Sorted: ${filePath}`);
  } else {
    console.log(`   - No changes: ${filePath}`);
  }
}

async function sortJsonFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const json = JSON.parse(content);
  const sorted = sortObjectKeys(json);
  const newContent = JSON.stringify(sorted, null, 2) + '\n';

  if (content !== newContent) {
    await writeFile(filePath, newContent, 'utf-8');
    console.log(`   ✅ Sorted: ${filePath}`);
  } else {
    console.log(`   - No changes: ${filePath}`);
  }
}

async function main() {
  console.log('\n🔄 Sorting all i18n files...\n');

  // Sort JSON locale files
  const languages = getLanguages();

  for (const lang of languages) {
    const domains = getDomains(lang);
    for (const domain of domains) {
      const filePath = join(process.cwd(), LOCALES_DIR, lang, `${domain}.json`);
      await sortJsonFile(filePath);
    }
  }

  // Also sort root JSON files if they exist
  for (const file of ROOT_LOCALE_FILES) {
    const filePath = join(process.cwd(), LOCALES_DIR, file);
    try {
      await sortJsonFile(filePath);
    } catch {
      // Skip if not exists
    }
  }

  // Sort TypeScript strings files
  const featuresDir = join(process.cwd(), FEATURES_DIR);
  const features = await readdir(featuresDir);

  for (const feature of features) {
    const stringsPath = join(featuresDir, feature, 'lib/strings.ts');
    try {
      await sortStringsFile(stringsPath);
    } catch {
      // File might not exist, skip
    }
  }

  // Also check core strings
  const coreStringsPath = join(process.cwd(), CORE_STRINGS_PATH);
  try {
    await sortStringsFile(coreStringsPath);
  } catch {
    // Skip if not exists
  }

  console.log('\n✅ Sorting complete!\n');
}

main();
