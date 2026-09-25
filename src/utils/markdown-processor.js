// src/utils/markdown-processor.js
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import DOMPurify from 'dompurify'

// 按需注册语言，避免引入全部 190+ 语言（减包体 ~500KB）
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml) // html / svg / xml
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('python', python)

// 轻量 frontmatter 解析（替代 gray-matter）：
// gray-matter 依赖 Node 的 Buffer 全局，在浏览器中抛 ReferenceError，
// 导致所有新闻在运行时静默解析失败。此处支持项目所需的 YAML 子集：
// 字符串（含引号）、数字、布尔、内联数组，以及 --- 包裹的结构。
function parseFrontmatter(raw) {
  const text = String(raw ?? '').replace(/^﻿/, '').replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!match) return { data: {}, content: text }

  const data = {}
  for (const line of match[1].split('\n')) {
    const entry = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim())
    if (!entry) continue
    const [, key, rawValue] = entry
    let value = rawValue.trim()

    // 内联数组: ["a", "b"] 或 [a, b]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim()
      data[key] = inner === ''
        ? []
        : inner.split(',').map(v => stripQuotes(v.trim()))
      continue
    }

    if (value === 'true') data[key] = true
    else if (value === 'false') data[key] = false
    else if (value !== '' && !Number.isNaN(Number(value))) data[key] = Number(value)
    else data[key] = stripQuotes(value)
  }
  return { data, content: text.slice(match[0].length) }
}

function stripQuotes(value) {
  if (value.length >= 2) {
    const first = value[0]
    if ((first === '"' && value.endsWith('"')) || (first === "'" && value.endsWith("'"))) {
      return value.slice(1, -1)
    }
  }
  return value
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 仅允许 http(s) 协议的绝对地址，或站内相对路径
function sanitizeUrl(url) {
  const raw = String(url ?? '').trim()
  if (!raw) return ''
  if (/^\/(?!\/)/.test(raw)) return raw // 站内相对路径（排除 //host 协议相对）
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return ''
    }
    return raw
  } catch {
    return ''
  }
}

function resolveAssetUrl(url) {
  const safe = sanitizeUrl(url)
  if (!safe || /^https?:/i.test(safe)) return safe
  // 站点绝对路径（public/ 目录，如 /assets/news/...）原样使用——
  // 不能拼接 ../assets，否则 Vite 构建时动态 URL 解析失败变成 /assets/undefined
  if (safe.startsWith('/')) return safe
  // 裸相对路径（如 img/SchoolGate.jpg）指向 src/assets：交给 Vite 处理为打包资源
  return new URL(`../assets/${safe}`, import.meta.url).href
}

function renderVideoEmbed(rawUrl) {
  const url = sanitizeUrl(rawUrl)
  if (!url) return ''

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" allowfullscreen loading="lazy" frameborder="0"></iframe></div>\n`
  }

  const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av(\d+))/)
  if (bilibiliMatch) {
    // BV 号用 bvid=；av 号必须用 aid=（bvid=av123 是无效参数）
    const playerParam = bilibiliMatch[2]
      ? `aid=${bilibiliMatch[2]}`
      : `bvid=${bilibiliMatch[1]}`
    return `<div class="video-embed"><iframe src="https://player.bilibili.com/player.html?${playerParam}&autoplay=0" allowfullscreen loading="lazy" frameborder="0" scrolling="no"></iframe></div>\n`
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return `<div class="video-embed"><video controls preload="metadata"><source src="${escapeHtml(url)}" /></video></div>\n`
  }

  return `<div class="video-embed"><iframe src="${escapeHtml(url)}" allowfullscreen loading="lazy" frameborder="0"></iframe></div>\n`
}

// Extension for @[video](url) block syntax
const videoExtension = {
  name: 'video',
  level: 'block',
  start(src) { return src.indexOf('@[video]') },
  tokenizer(src) {
    const match = /^@\[video\]\(([^)]+)\)\n?/.exec(src)
    if (match) {
      return { type: 'video', raw: match[0], url: match[1].trim() }
    }
  },
  renderer(token) {
    return renderVideoEmbed(token.url)
  }
}

// iframe 仅允许来自可信视频平台（renderVideoEmbed 的输出），
// Markdown 正文中直写的第三方 iframe 一律移除
const TRUSTED_IFRAME_HOSTS = ['player.bilibili.com', 'www.youtube.com', 'youtube-nocookie.com']

// 统一 XSS 过滤：
// marked 的自定义 renderer 只覆盖了 image/video，原生 HTML 与 <a> 不经过 renderer，
// 因此必须对最终 HTML 整体过滤（防御 Markdown 内嵌 <script>/<img onerror>/javascript: 链接）
function sanitizeHtml(html) {
  // uponSanitizeElement 钩子在校验白名单属性前执行，逐节点过滤 iframe
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return
    const src = node.getAttribute('src') || ''
    let host = ''
    try {
      const parsed = new URL(src)
      if (parsed.protocol !== 'https:') throw new Error('insecure')
      host = parsed.hostname
    } catch {
      node.remove()
      return
    }
    if (!TRUSTED_IFRAME_HOSTS.includes(host)) node.remove()
  })

  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'allowfullscreen', 'loading', 'frameborder', 'scrolling'],
    FORBID_TAGS: ['style', 'form'],
    ALLOWED_URI_REGEXP: /^(?:https?:|\/(?!\/)|#)/,
  })

  DOMPurify.removeHook('uponSanitizeElement')
  return clean
}

class MarkdownProcessor {
  constructor() {
    this.setupMarked()
  }

  setupMarked() {
    const renderer = {
      code({ text, lang }) {
        const validLang = lang && hljs.getLanguage(lang)
        const highlighted = validLang
          ? hljs.highlight(text, { language: lang }).value
          : escapeHtml(text) // 未注册语言时转义输出，避免 highlightAuto 的开销与泄露
        const langClass = lang ? ` language-${escapeHtml(lang)}` : ''
        return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>\n`
      },
      image({ href, title, text }) {
        const safeSrc = resolveAssetUrl(href) || escapeHtml(href)
        const safeAlt = escapeHtml(text)
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
        const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ''
        return `<figure class="news-image"><img src="${safeSrc}" alt="${safeAlt}"${titleAttr} loading="lazy" />${caption}</figure>\n`
      }
    }

    marked.use({
      breaks: true,
      gfm: true,
      async: false,
      renderer,
      extensions: [videoExtension]
    })
  }

  processFile(markdownContent) {
    const { data: frontMatter = {}, content = '' } = parseFrontmatter(markdownContent)
    const html = this.sanitize(marked.parse(content))

    return {
      metadata: {
        ...frontMatter,
        slug: this.generateSlug(frontMatter.title, frontMatter.date)
      },
      content: html,
      excerpt: this.generateExcerpt(content),
      readingTime: this.calculateReadingTime(content)
    }
  }

  sanitize(html) {
    return sanitizeHtml(html)
  }

  generateSlug(title, date) {
    // 守卫：frontmatter 缺失关键字段时降级，而不是抛 Invalid time value 让文章静默消失
    const safeTitle = String(title ?? 'untitled')
    const parsedDate = date ? new Date(date) : null
    const dateStr =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().split('T')[0]
        : 'undated'
    const titleSlug = safeTitle
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return `${dateStr}-${titleSlug || 'untitled'}`
  }

  generateExcerpt(content, maxLength = 150) {
    const plainText = content.replace(/[#*`\[\]]/g, '').trim()
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText
  }

  calculateReadingTime(content) {
    // 中文按字数（约 300 字/分钟），英文按词数（约 200 词/分钟）
    const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const latinWords = content
      .replace(/[\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length
    const minutes = Math.ceil(cjkChars / 300 + latinWords / 200)
    return Math.max(minutes, 1)
  }
}

export default new MarkdownProcessor()
