/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Phaser is intentionally isolated as a vendor chunk and exceeds Vite's default 500 kB warning limit.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['react-redux', '@reduxjs/toolkit'],
          phaser: ['phaser'],
        },
      },
    },
  },
  test: {
    coverage: {
      provider: 'v8',
    },
  },
});
