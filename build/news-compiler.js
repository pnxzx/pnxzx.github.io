// 构建期新闻编译：被虚拟模块插件与预渲染插件共用
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

export async function compileNews(root) {
  // DOMPurify 需要 DOM：为构建期提供 jsdom 环境
  if (typeof globalThis.window === 'undefined') {
    const dom = new JSDOM('')
    globalThis.window = dom.window
    globalThis.document = dom.window.document
  }
  const { default: processor } = await import('../src/utils/markdown-processor.js')

  const dir = path.join(root, 'src', 'content', 'news')
  const files = []
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = path.join(current, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (entry.endsWith('.md')) files.push(full)
    }
  }
  walk(dir)

  const items = []
  for (const file of files) {
    try {
      const processed = processor.processFile(readFileSync(file, 'utf8'))
      const rel = path.relative(dir, file).split(path.sep).join('/').replace(/\.md$/, '')
      items.push({ ...processed, path: rel, url: '/news/' + processed.metadata.slug })
    } catch (error) {
      throw new Error('处理新闻失败 ' + file + ': ' + error.message, { cause: error })
    }
  }
  items.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date))
  return items
}
