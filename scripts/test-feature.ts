#!/usr/bin/env tsx

import { execSync } from 'child_process';

const feature = process.argv[2];

if (!feature) {
  console.error('Usage: npm run test:feature <feature-name>');
  console.error('Example: npm run test:feature auth');
  process.exit(1);
}

const includePattern = `src/features/${feature}/**/*.test.ts,src/features/${feature}/**/*.test.tsx`;

console.log(`Running tests for feature: ${feature}`);
console.log(`Include pattern: ${includePattern}`);

try {
  execSync('vitest run', {
    env: { ...process.env, VITEST_INCLUDE: includePattern },
    stdio: 'inherit',
  });
} catch {
  process.exit(1);
}
