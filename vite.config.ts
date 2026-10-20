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
       * 阈值基线（2026-10-20 实测，Node 22）：Statements 11.29 / Branches 8.46 /
       * Functions 10.97 / Lines 11.32。
       * 取值规则 = floor(实测) − 1，只允许升不允许降：阈值语义是「锁住不倒退」，
       * 不是「设一个能过的数」。放低到远低于实测值，等于给门禁留出 20% 的相对松弛，
       * 覆盖率从 11.32 掉到 9.05 都照样绿。
       * 注意：本门禁只在 `--coverage` 运行时生效（见 package.json 的 test:coverage），
       * 且对 Node 大版本敏感（v8 语句/分支计数会漂移），故 .nvmrc 与 engines 一并钉死。
       */
      thresholds: {
        lines: 10,
        statements: 10,
        branches: 7,
        functions: 9,
      },
    },
  },
});
