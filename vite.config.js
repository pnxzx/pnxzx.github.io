import { fileURLToPath, URL } from 'node:url'
import { cpSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { parseFrontmatter, generateSlug } from './src/utils/frontmatter.js'
import { newsDataPlugin } from './build/news-data-plugin.js'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const DIST = path.join(ROOT, 'dist')
const SITE_URL = 'https://pnxzx.github.io'

// 页脚显示构建版本，方便线上核对部署是否生效
function buildVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim()
  } catch {
    return 'dev'
  }
}

function collectNewsFiles() {
  const dir = path.join(ROOT, 'src', 'content', 'news')
  const items = []
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = path.join(current, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (entry.endsWith('.md')) {
        const { data } = parseFrontmatter(readFileSync(full, 'utf8'))
        items.push({ slug: generateSlug(data.title, data.date), date: data.date })
      }
    }
  }
  try {
    walk(dir)
  } catch {
    /* 无内容目录时忽略 */
  }
  return items
}

function generateSitemap() {
  const staticRoutes = ['/', '/about', '/news', '/forum', '/contact']
  const urls = staticRoutes.map((p) => ({
    loc: `${SITE_URL}${p}`,
    changefreq: p === '/' ? 'weekly' : 'monthly',
    priority: p === '/' ? '1.0' : '0.7',
  }))
  for (const item of collectNewsFiles()) {
    const date = item.date ? new Date(item.date) : null
    urls.push({
      loc: `${SITE_URL}/news/${encodeURI(item.slug)}`,
      lastmod: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : undefined,
      changefreq: 'yearly',
      priority: '0.6',
    })
  }

  const body = urls
    .map((u) => {
      const parts = [`    <loc>${u.loc}</loc>`]
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`)
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`)
      if (u.priority) parts.push(`    <priority>${u.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

// GitHub Pages 静态托管无法做 history 路由回退：
// 复制 index.html 为 404.html，未匹配路径统一落到 SPA 入口；同时生成 sitemap
function ghPagesFallback() {
  return {
    name: 'gh-pages-fallback',
    apply: 'build', // 避免 vitest/dev 触发
    closeBundle() {
      cpSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'))
      writeFileSync(path.join(DIST, 'sitemap.xml'), generateSitemap(), 'utf8')
      console.log('[gh-pages-fallback] 404.html + sitemap.xml generated')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), newsDataPlugin(), ghPagesFallback()],
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion()),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
