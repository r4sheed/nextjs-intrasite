import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react');
  return {
    plugins: [react(), tsconfigPaths()],
    test: {
      environment: 'jsdom',
      env: loadEnv('test', process.cwd(), ''),
      include: process.env.VITEST_INCLUDE
        ? process.env.VITEST_INCLUDE.split(',')
        : ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
      globals: true,
      setupFiles: ['src/test/setup.ts'],
    },
  };
});
