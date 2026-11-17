// 共享 Markdown 渲染：marked + DOMPurify + 图片安全后处理
// 供留言板（及未来其他评论场景）复用
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { IMAGE_HOST_BLACKLIST } from '@/config/guestbook.js'

marked.setOptions({ breaks: true, gfm: true, async: false })

export function isBlacklistedHost(src, blacklist = IMAGE_HOST_BLACKLIST) {
  if (!blacklist || blacklist.length === 0) return false
  try {
    const host = new URL(src).hostname.toLowerCase()
    return blacklist.some((domain) => {
      const d = String(domain).toLowerCase()
      return host === d || host.endsWith('.' + d)
    })
  } catch {
    return false
  }
}

/**
 * 渲染留言正文为安全 HTML：
 * - 过滤脚本/事件属性（DOMPurify）
 * - 图片：http 升级 https、黑名单替换为链接、懒加载、no-referrer、可点击放大
 * - 链接：新窗口打开并加 rel=noopener
 */
export function renderMarkdown(markdown, { blacklist = IMAGE_HOST_BLACKLIST } = {}) {
  const raw = DOMPurify.sanitize(marked.parse(markdown || ''), {
    ALLOWED_URI_REGEXP: /^(?:https?:\/\/|\/(?!\/)|#)/,
  })

  const template = document.createElement('template')
  template.innerHTML = raw

  template.content.querySelectorAll('img').forEach((img) => {
    let src = img.getAttribute('src') || ''
    if (src.startsWith('http://')) src = 'https://' + src.slice('http://'.length)

    if (isBlacklistedHost(src, blacklist)) {
      const link = document.createElement('a')
      link.href = src
      link.textContent = '[图片来自已屏蔽的图床]'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      img.replaceWith(link)
      return
    }

    img.setAttribute('src', src)
    img.setAttribute('loading', 'lazy')
    img.setAttribute('decoding', 'async')
    img.setAttribute('referrerpolicy', 'no-referrer')
    img.setAttribute('class', 'md-image')
    img.setAttribute('tabindex', '0')
    img.setAttribute('role', 'button')
    img.setAttribute('aria-label', '查看大图')
    img.removeAttribute('width')
    img.removeAttribute('height')
  })

  template.content.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  })

  return template.innerHTML
}
