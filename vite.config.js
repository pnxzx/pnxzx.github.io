import { fileURLToPath, URL } from 'node:url'
import { cpSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { parseFrontmatter, generateSlug } from './src/utils/frontmatter.js'
import { compileNews } from './build/news-compiler.js'
import { newsDataPlugin } from './build/news-data-plugin.js'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const DIST = path.join(ROOT, 'dist')
const SITE_URL = 'https://pnxzx.github.io'

const DEFAULT_TITLE = '平南县中学欢迎您'
const DEFAULT_DESC = '平南县中学非官方网站：学校简介、新闻动态与联系方式。本站与学校官方无关联，信息仅供参考。'
const DEFAULT_TW_DESC = '平南县中学非官方网站：学校简介、新闻动态与联系方式。'

const STATIC_PAGES = [
  { path: '/about', title: '学校简介 - 平南县中学', description: '平南县中学简介：创建于1909年的自治区示范性普通高中，百年办学历史与八棵大榕树的校园传统。' },
  { path: '/news', title: '新闻动态 - 平南县中学', description: '平南县中学新闻动态：开学通知、校园活动与官方公告。' },
  { path: '/forum', title: '交流论坛 - 平南县中学', description: '平南县中学交流论坛：基于 GitHub Discussions 的社区讨论区。' },
  { path: '/contact', title: '联系我们 - 平南县中学', description: '平南县中学联系方式：地址、电话与邮箱。' },
]

// 页脚显示构建版本，方便线上核对部署是否生效
function buildVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim()
  } catch {
    return 'dev'
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
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

// 用页面级元信息替换 index.html 的默认值（同时注入 noscript 正文供不执行 JS 的爬虫读取）
function withMeta(baseHtml, page) {
  const url = `${SITE_URL}${page.path}`
  let html = baseHtml
    .split(`<title>${DEFAULT_TITLE}</title>`).join(`<title>${escapeHtml(page.title)}</title>`)
    .split(`content="${DEFAULT_TITLE}"`).join(`content="${escapeHtml(page.title)}"`)
    .split(`content="${DEFAULT_DESC}"`).join(`content="${escapeHtml(page.description)}"`)
    .split(`content="${DEFAULT_TW_DESC}"`).join(`content="${escapeHtml(page.description)}"`)
    .split('content="https://pnxzx.github.io/"').join(`content="${url}"`)
    .split('</head>').join(`  <link rel="canonical" href="${url}">\n  </head>`)

  if (page.body) {
    const noscript = `<noscript><article><h1>${escapeHtml(page.title.replace(' - 平南县中学', ''))}</h1>${page.body}</article></noscript>`
    html = html.replace('<div id="app"></div>', `${noscript}\n    <div id="app"></div>`)
  }
  return html
}

async function prerenderPages(baseHtml) {
  const news = await compileNews(ROOT)
  const pages = [
    ...STATIC_PAGES,
    ...news.map((item) => ({
      path: item.url,
      title: `${item.metadata.title} - 平南县中学`,
      description: item.metadata.summary || item.metadata.excerpt || DEFAULT_DESC,
      body: item.content,
    })),
  ]

  for (const page of pages) {
    const dir = path.join(DIST, ...page.path.split('/').filter(Boolean))
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, 'index.html'), withMeta(baseHtml, page), 'utf8')
  }
  console.log(`[prerender] ${pages.length} 个页面已生成独立 meta`)
}

// GitHub Pages 静态托管无法做 history 路由回退：
// 复制 index.html 为 404.html；为每个路由生成带 meta 的静态页；生成 sitemap
function ghPagesFallback() {
  return {
    name: 'gh-pages-fallback',
    apply: 'build',
    async closeBundle() {
      const baseHtml = readFileSync(path.join(DIST, 'index.html'), 'utf8')
      cpSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'))
      writeFileSync(path.join(DIST, 'sitemap.xml'), generateSitemap(), 'utf8')
      await prerenderPages(baseHtml)
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
