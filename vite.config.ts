import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  // 关键配置：设置为相对路径 './'
  // 因为扩展不是运行在服务器根目录下，而是 chrome-extension://[ID]/ 之下
  base: './',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 生产环境移除 console.log，保持干净
    minify: 'terser', 
  }
})