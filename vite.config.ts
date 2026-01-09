import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

// 获取当前的 Git Commit Hash
let commitHash = '';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  commitHash = 'unknown'; // 如果没有 git 环境时的后备方案
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    '__COMMIT_HASH__': JSON.stringify(commitHash),
  },
  base: './',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser', 
  }
})