import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json' // 直接导入 manifest json 对象

export default defineConfig({
  plugins: [
    react(),
    // CRX 插件接管打包逻辑
    crx({ manifest }),
  ],
  // CRXJS 会自动处理路径，通常不需要手动设置 base，但保留也无妨
  server: {
    port: 3000,
    // 解决 HMR 在扩展环境下的 WebSocket 连接问题
    hmr: {
      port: 3000,
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    // 必须设置 rollupOptions 以为 content script 生成固定文件名（可选，但推荐）
    rollupOptions: {
      output: {
        // 让生成的文件名更可读，方便调试
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  }
})