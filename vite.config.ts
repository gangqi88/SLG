/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

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
          phaser: ['phaser'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      /**
       * 必须显式声明 include：默认只统计「被测试加载到的文件」，
       * 那样删测试反而会抬高覆盖率，且新增未测文件不会拉低数字。
       * 声明后覆盖率反映真实的 src 全貌。
       */
      include: ['src/**/*.{ts,tsx}'],
      /**
       * 不清理报告目录：删除整棵 coverage 树在带删除保护的环境（沙箱/企业安全策略）
       * 会被拦成硬错误，让整条 verify 无故变红。影响仅限 html 报告里可能残留已删文件，
       * 阈值计算不受影响（每次运行都重新生成）。CI 是干净检出，无需清理。
       */
      clean: false,
      /**
       * 阈值基线（2026-xx 实测）：Statements 11.29 / Branches 8.46 /
       * Functions 10.97 / Lines 11.32。阈值取整下调留余量，只允许升不允许降。
       * 注意：本门禁只在 `--coverage` 运行时生效（见 package.json 的 test:coverage）。
       */
      thresholds: {
        lines: 9,
        statements: 9,
        branches: 7,
        functions: 8,
      },
    },
  },
});
