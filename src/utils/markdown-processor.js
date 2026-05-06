// src/utils/markdown-processor.js
import { marked } from 'marked'
import matter from 'gray-matter'
import hljs from 'highlight.js'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function sanitizeUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return ''
    }
    return url
  } catch {
    return ''
  }
}

function renderVideoEmbed(rawUrl) {
  const url = sanitizeUrl(rawUrl)
  if (!url) return ''

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" allowfullscreen loading="lazy" frameborder="0"></iframe></div>\n`
  }

  const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av\d+)/)
  if (bilibiliMatch) {
    return `<div class="video-embed"><iframe src="https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&autoplay=0" allowfullscreen loading="lazy" frameborder="0" scrolling="no"></iframe></div>\n`
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
          : hljs.highlightAuto(text).value
        const langClass = lang ? ` language-${lang}` : ''
        return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>\n`
      },
      image({ href, title, text }) {
        const safeSrc = sanitizeUrl(href) || escapeHtml(href)
        const safeAlt = escapeHtml(text)
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
        const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ''
        return `<figure class="news-image"><img src="${safeSrc}" alt="${safeAlt}"${titleAttr} loading="lazy" />${caption}</figure>\n`
      }
    }

    marked.use({
      breaks: true,
      gfm: true,
      renderer,
      extensions: [videoExtension]
    })
  }

  processFile(markdownContent) {
    const { data: frontMatter, content } = matter(markdownContent)
    const html = marked(content)
    
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

  generateSlug(title, date) {
    const dateStr = new Date(date).toISOString().split('T')[0]
    const titleSlug = title
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return `${dateStr}-${titleSlug}`
  }

  generateExcerpt(content, maxLength = 150) {
    const plainText = content.replace(/[#*`\[\]]/g, '').trim()
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText
  }

  calculateReadingTime(content) {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export default new MarkdownProcessor()