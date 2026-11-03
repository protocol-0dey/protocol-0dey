/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@dnd-kit')) return 'dnd';
          if (id.includes('node_modules')) return 'vendor';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/app/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', include: ['src/**'], exclude: ['src/**/*.test.*'] },
  },
});
