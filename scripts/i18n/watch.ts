#!/usr/bin/env tsx
/**
 * i18n Watch Mode Script
 *
 * Automatically syncs i18n files when strings.ts files change
 * Runs in the background and provides real-time feedback during development
 *
 * Usage:
 *   npx tsx scripts/i18n/watch.ts [--dry-run]
 */

import chokidar, { FSWatcher } from 'chokidar';

import { getStringsFiles } from './helpers.js';
import { main as syncMain } from './sync.js';

// CLI arguments
const isDryRun = process.argv.includes('--dry-run');

// Debounce configuration
const DEBOUNCE_MS = 500; // Wait 500ms after last change before syncing
let debounceTimer: NodeJS.Timeout | null = null;
let isSyncing = false;

// Track watched files for reporting
const watchedFiles = new Set<string>();

/**
 * Run sync with debouncing to avoid multiple rapid syncs
 */
async function debouncedSync(changedFile: string) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    if (isSyncing) {
      console.log(
        `⏳ Sync already in progress, skipping change in ${changedFile}`
      );
      return;
    }

    isSyncing = true;

    try {
      console.log(`\n📝 ${changedFile} changed, syncing...`);
      console.log(`🔄 Running ${isDryRun ? 'dry-run' : 'live'} sync...\n`);

      // Temporarily override process.argv for the sync script
      const originalArgv = process.argv;
      if (isDryRun) {
        process.argv = [...process.argv, '--dry-run'];
      }

      await syncMain();

      process.argv = originalArgv;

      console.log(`\n✅ Sync completed for ${changedFile}\n`);
    } catch (error) {
      console.error(`❌ Sync failed for ${changedFile}:`, error);
    } finally {
      isSyncing = false;
    }
  }, DEBOUNCE_MS);
}

/**
 * Setup file watcher
 */
function setupWatcher() {
  // Get initial list of strings files
  const stringsFiles = getStringsFiles();
  console.log(`📂 Found ${stringsFiles.length} strings files:`);
  for (const file of stringsFiles) {
    console.log(`   - ${file}`);
  }
  console.log('');

  const watcher = chokidar.watch(stringsFiles, {
    ignored: [/node_modules/, /\.git/, /dist/, /build/, /\.next/],
    persistent: true,
    ignoreInitial: true, // Don't trigger on startup
    awaitWriteFinish: {
      stabilityThreshold: 100, // Wait for file to be stable
      pollInterval: 50,
    },
  });

  // Handle file changes
  watcher.on('change', path => {
    const relativePath = path.replace(/\\/g, '/');
    watchedFiles.add(relativePath);
    debouncedSync(relativePath);
  });

  // Handle new files
  watcher.on('add', path => {
    const relativePath = path.replace(/\\/g, '/');
    watchedFiles.add(relativePath);
    console.log(`📁 New strings file detected: ${relativePath}`);
    debouncedSync(relativePath);
  });

  // Handle deleted files
  watcher.on('unlink', path => {
    const relativePath = path.replace(/\\/g, '/');
    watchedFiles.delete(relativePath);
    console.log(`🗑️  Strings file removed: ${relativePath}`);
    // Note: We don't auto-sync on delete as it might cause issues
  });

  // Handle watcher errors
  watcher.on('error', error => {
    console.error('❌ Watcher error:', error);
  });

  // Initial scan
  watcher.on('ready', () => {
    console.log('🔍 Initial scan complete. Watching:');

    stringsFiles.forEach(file => {
      console.log(`   📄 ${file}`);
      watchedFiles.add(file);
    });

    console.log(`\n📊 Total files being watched: ${stringsFiles.length}`);
    console.log(
      `🔄 Mode: ${isDryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be updated)'}`
    );
    console.log('\n💡 Press Ctrl+C to stop watching\n');
  });

  return watcher;
}

/**
 * Graceful shutdown
 */
function setupGracefulShutdown(watcher: FSWatcher) {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down...`);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    await watcher.close();

    console.log('✅ Watcher stopped. Goodbye! 👋\n');
    process.exit(0);
  };

  // Handle various termination signals
  process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
  process.on('SIGTERM', () => shutdown('SIGTERM')); // Termination signal
  process.on('SIGUSR2', () => shutdown('SIGUSR2')); // Nodemon restart

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    console.error('💥 Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    const watcher = setupWatcher();
    setupGracefulShutdown(watcher);
  } catch (error) {
    console.error('❌ Failed to start watch mode:', error);
    process.exit(1);
  }
}

// Run if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.includes('watch.ts')
) {
  main();
}
