// 构建期预编译新闻：把 src/content/news/**/*.md 解析为 JSON 模块
// 浏览器不再需要 marked / highlight.js / DOMPurify 处理新闻
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

const VIRTUAL_ID = 'virtual:news-data'
const RESOLVED_ID = '\0' + VIRTUAL_ID

export function newsDataPlugin() {
  let root = process.cwd()
  let processor = null

  async function getProcessor() {
    if (processor) return processor
    // DOMPurify 需要 DOM 环境：构建期用 jsdom 提供
    const dom = new JSDOM('')
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    const mod = await import('../src/utils/markdown-processor.js')
    processor = mod.default
    return processor
  }

  function collectMarkdown(dir) {
    const files = []
    const walk = (current) => {
      for (const entry of readdirSync(current)) {
        const full = path.join(current, entry)
        if (statSync(full).isDirectory()) walk(full)
        else if (entry.endsWith('.md')) files.push(full)
      }
    }
    walk(dir)
    return files
  }

  async function generateModule() {
    const proc = await getProcessor()
    const dir = path.join(root, 'src', 'content', 'news')
    const items = []
    for (const file of collectMarkdown(dir)) {
      try {
        const processed = proc.processFile(readFileSync(file, 'utf8'))
        const rel = path.relative(dir, file).split(path.sep).join('/').replace(/\.md$/, '')
        items.push({ ...processed, path: rel, url: `/news/${processed.metadata.slug}` })
      } catch (error) {
        // 构建期直接报错，避免文章在线上静默消失
        throw new Error(`处理新闻失败 ${file}: ${error.message}`, { cause: error })
      }
    }
    items.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date))
    return `export default ${JSON.stringify(items)}`
  }

  return {
    name: 'news-data',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) return generateModule()
    },
    configureServer(server) {
      const newsDir = path.join(root, 'src', 'content', 'news')
      server.watcher.add(newsDir)
      server.watcher.on('change', (file) => {
        if (!file.includes(path.join('content', 'news'))) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
