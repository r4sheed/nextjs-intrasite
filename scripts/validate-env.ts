#!/usr/bin/env node
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';

import { getEnvValidationSchema } from '@/lib/env';

// Load .env for local development when this script runs
loadEnv();

// Schema is built lazily in the shared `src/lib/env.ts` to keep definitions
// centralized while avoiding static imports of `zod` in client bundles.

export async function validateEnv(env = process.env) {
  const schema = await getEnvValidationSchema();
  const result = schema.safeParse(env);

  if (!result.success) {
    const issues = result.error.issues;
    console.error(
      `\n❌ Environment validation failed (${issues.length} issue${issues.length > 1 ? 's' : ''}):`
    );
    for (const issue of issues) {
      console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
    }
    throw result.error;
  }

  return result.data;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  (async () => {
    try {
      await validateEnv();
      console.log('\n✅ Environment validated successfully');
    } catch {
      console.error('\n❌ Validation failed — see errors above');
      process.exit(1);
    }
  })();
}
