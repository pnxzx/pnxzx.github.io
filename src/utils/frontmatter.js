// 纯函数模块：frontmatter 解析与 slug 生成
// 同时被浏览器端（markdown-processor）与构建脚本（sitemap 插件）复用

/**
 * 解析 --- 包裹的 YAML 子集（字符串/数字/布尔/内联数组）
 * @param {string} raw
 * @returns {{ data: Record<string, any>, content: string }}
 */
export function parseFrontmatter(raw) {
  const text = String(raw ?? '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!match) return { data: {}, content: text }

  const data = {}
  for (const line of match[1].split('\n')) {
    const entry = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim())
    if (!entry) continue
    const [, key, rawValue] = entry
    const value = rawValue.trim()

    // 内联数组: ["a", "b"] 或 [a, b]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim()
      data[key] = inner === '' ? [] : inner.split(',').map(v => stripQuotes(v.trim()))
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

/**
 * 生成文章 slug：{YYYY-MM-DD}-{标题}（保留中文）
 */
export function generateSlug(title, date) {
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
