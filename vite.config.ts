/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

// Function to check if it's an SSR build
const isSsrBuild = () =>
  !!process.env['SSR'] || process.env['NODE_ENV'] === 'production';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [analog()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
    // Conditionally define for SSR builds, pulling from process.env
    ...(isSsrBuild()
      ? {
          'import.meta.env.VITE_ANALOG_PUBLIC_SITE_URL': JSON.stringify(
            process.env['VITE_ANALOG_PUBLIC_SITE_URL']
          ),
        }
      : {}),
  },
}));
