#!/usr/bin/env tsx
import { fileURLToPath } from 'node:url';

import { sortAllI18nFiles } from './sort';

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  sortAllI18nFiles().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
