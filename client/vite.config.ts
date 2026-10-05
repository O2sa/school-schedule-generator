/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production' || command === 'build';
  const basePath = process.env.VITE_BASE_PATH || (isProd ? '/school-schedule-generator/' : '/');

  return {
    base: basePath,
    plugins: [react()],
    resolve: {
      alias: {
        'school-timetabling-engine': path.resolve(__dirname, '../packages/school-timetabling-engine/src/index.ts'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
    },
    build: {
      outDir: 'dist',
    },
  };
});
