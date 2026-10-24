// 运行时页面元信息同步：title / description / Open Graph / canonical
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/config/site.js'

function setMeta(selector, attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * @param {{ title?: string, description?: string, path?: string, image?: string }} meta
 */
export function applyPageMeta({ title, description, path, image } = {}) {
  const pageTitle = title || DEFAULT_TITLE
  const desc = description || SITE_DESCRIPTION
  const url = `${SITE_URL}${path || window.location.pathname}`

  document.title = pageTitle
  setMeta('meta[name="description"]', 'name', 'description', desc)
  setMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle)
  setMeta('meta[property="og:description"]', 'property', 'og:description', desc)
  setMeta('meta[property="og:url"]', 'property', 'og:url', url)
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME)
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle)
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc)
  if (image) {
    const absolute = image.startsWith('http') ? image : `${SITE_URL}${image}`
    setMeta('meta[property="og:image"]', 'property', 'og:image', absolute)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absolute)
  }
  setLink('canonical', url)
}
