import { fileURLToPath, URL } from 'node:url'
import { cpSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// GitHub Pages 静态托管无法做 history 路由回退：
// 复制 index.html 为 404.html，未匹配路径统一落到 SPA 入口
function ghPagesSpaFallback() {
  return {
    name: 'gh-pages-spa-fallback',
    closeBundle() {
      cpSync(
        fileURLToPath(new URL('./dist/index.html', import.meta.url)),
        fileURLToPath(new URL('./dist/404.html', import.meta.url))
      )
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ghPagesSpaFallback(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
