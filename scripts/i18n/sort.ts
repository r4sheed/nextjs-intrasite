import { getLabelSuffixRank } from './helpers';

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
