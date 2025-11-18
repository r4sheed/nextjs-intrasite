#!/usr/bin/env tsx
/**
 * i18n Parser Module
 *
 * Parses TypeScript strings.ts files to extract exported constants
 * Used by strings-first sync to generate JSON from constants
 */

import { readFile } from 'node:fs/promises';

export interface ParsedConstant {
  constantName: string;
  keys: Array<{ key: string; value: string }>;
  filePath: string;
  lineNumber: number;
}

export interface ParsedStringsFile {
  filePath: string;
  constants: ParsedConstant[];
}

/**
 * Parse a strings.ts file and extract all exported constants
 */
export async function parseStringsFile(
  filePath: string
): Promise<ParsedStringsFile> {
  const content = await readFile(filePath, 'utf-8');
  const constants: ParsedConstant[] = [];

  // Match export const NAME = { ... } as const; patterns
  const constantRegex = /export const (\w+) = \{([\s\S]*?)\} as const;/g;

  let match;
  while ((match = constantRegex.exec(content)) !== null) {
    const constantName = match[1]!;
    const body = match[2]!;

    // Find the line number of this constant
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;

    const keys = parseConstantBody(body);

    constants.push({
      constantName,
      keys,
      filePath,
      lineNumber,
    });
  }

  return {
    filePath,
    constants,
  };
}

/**
 * Parse the body of a constant object to extract key-value pairs
 * Exported for testing purposes
 */
export function parseConstantBody(
  body: string
): Array<{ key: string; value: string }> {
  const keys: Array<{ key: string; value: string }> = [];
  const lines = body.split(/\r?\n/);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('//')) {
      i++;
      continue;
    }

    // Handle single-line entries: key: 'value',
    const singleLineMatch = line.match(/^([A-Za-z0-9_]+):\s*'([^']*)',?$/);
    if (singleLineMatch) {
      const key = singleLineMatch[1]!;
      const value = singleLineMatch[2]!;
      keys.push({ key, value });
      i++;
      continue;
    }

    // Handle multi-line entries: key:
    //   'value',
    const multiLineKeyMatch = line.match(/^([A-Za-z0-9_]+):$/);
    if (multiLineKeyMatch && i + 1 < lines.length) {
      const key = multiLineKeyMatch[1]!;
      const nextLine = lines[i + 1]!.trim();

      const multiLineValueMatch = nextLine.match(/^'([^']*)',?$/);
      if (multiLineValueMatch) {
        const value = multiLineValueMatch[1]!;
        keys.push({ key, value });
        i += 2; // Skip both lines
        continue;
      }
    }

    // If we can't parse the line, skip it (could be malformed)
    i++;
  }

  return keys;
}

/**
 * Parse multiple strings files
 */
export async function parseStringsFiles(
  filePaths: string[]
): Promise<ParsedStringsFile[]> {
  const results: ParsedStringsFile[] = [];

  for (const filePath of filePaths) {
    try {
      const parsed = await parseStringsFile(filePath);
      results.push(parsed);
    } catch (error) {
      console.error(`Failed to parse ${filePath}:`, error);
      throw error;
    }
  }

  return results;
}
