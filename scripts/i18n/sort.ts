#!/usr/bin/env tsx
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LOCALES_DIR,
  FEATURES_DIR,
  ROOT_LOCALE_FILES,
  CORE_STRINGS_PATH,
} from './constants';
import { getLanguages, getDomains, getLabelSuffixRank } from './helpers';

const DEFAULT_COMPARATOR = (a: string, b: string) => a.localeCompare(b);

export function compareLabelKeys(a: string, b: string): number {
  const rankA = getLabelSuffixRank(a);
  const rankB = getLabelSuffixRank(b);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return a.localeCompare(b);
}

function getComparatorForPath(
  path: string[]
): (a: string, b: string) => number {
  const lastSegment = path.at(-1);
  if (lastSegment === 'labels') {
    return compareLabelKeys;
  }

  return DEFAULT_COMPARATOR;
}

export function sortObjectKeys(obj: unknown, path: string[] = []): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj);
  const comparator = getComparatorForPath(path);

  keys.sort(comparator);

  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key], [
      ...path,
      key,
    ]);
  }

  return sorted;
}

function addLabelGroupSeparators(lines: string[]): string[] {
  const result: string[] = [];
  let prevRank: number | null = null;

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
        (groupCounts.get(rank) || 0) >= 1
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

  const constantRegex = /export const ([A-Z_]+) = \{([\s\S]*?)\} as const;/g;
  let match;

  while ((match = constantRegex.exec(content)) !== null) {
    const constantName = match[1]!;
    const body = match[2]!;

    const lines = body.split(/\r?\n/);
    const keyLines: Array<{ key: string; line: string }> = [];

    let index = 0;
    while (index < lines.length) {
      const line = lines[index]!;
      const trimmed = line.trim();

      if (trimmed.startsWith('//')) {
        index++;
        continue;
      }

      const singleLineMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*'([^']+)',?$/);
      if (singleLineMatch) {
        const key = singleLineMatch[1]!;
        keyLines.push({ key, line });
        index++;
        continue;
      }

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

    const isLabels = constantName.endsWith('_LABELS');
    const comparator = isLabels
      ? compareLabelKeys
      : (a: string, b: string) => a.localeCompare(b);

    keyLines.sort((a, b) => comparator(a.key, b.key));

    let newLines = keyLines.map(item => item.line);

    if (isLabels) {
      newLines = addLabelGroupSeparators(newLines);
    }

    const oldBlock = `export const ${constantName} = {${body}} as const;`;
    const newBlock = `export const ${constantName} = {
${newLines.join('\n')}
} as const;`;

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

export async function sortAllI18nFiles(): Promise<void> {
  console.log('\n🔄 Sorting all i18n files...\n');

  const languages = getLanguages();

  for (const lang of languages) {
    const domains = getDomains(lang);
    for (const domain of domains) {
      const filePath = join(process.cwd(), LOCALES_DIR, lang, `${domain}.json`);
      await sortJsonFile(filePath);
    }
  }

  for (const file of ROOT_LOCALE_FILES) {
    const filePath = join(process.cwd(), LOCALES_DIR, file);
    try {
      await sortJsonFile(filePath);
    } catch {
      // Skip if not exists
    }
  }

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

  const coreStringsPath = join(process.cwd(), CORE_STRINGS_PATH);
  try {
    await sortStringsFile(coreStringsPath);
  } catch {
    // Skip if not exists
  }

  console.log('\n✅ Sorting complete!\n');
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  sortAllI18nFiles().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
