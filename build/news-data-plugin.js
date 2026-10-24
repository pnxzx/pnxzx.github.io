// 构建期预编译新闻：把 src/content/news/**/*.md 解析为 JSON 模块
// 浏览器不再需要 marked / highlight.js / DOMPurify 处理新闻
import path from 'node:path'
import { compileNews } from './news-compiler.js'

const VIRTUAL_ID = 'virtual:news-data'
const RESOLVED_ID = '\0' + VIRTUAL_ID

export function newsDataPlugin() {
  let root = process.cwd()

  return {
    name: 'news-data',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    async load(id) {
      if (id !== RESOLVED_ID) return
      const items = await compileNews(root)
      return 'export default ' + JSON.stringify(items)
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
