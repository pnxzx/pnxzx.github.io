// src/utils/news-generator.js
import MarkdownProcessor from './markdown-processor.js'

class NewsGenerator {
  constructor() {
    // 缓存完整列表，进程内只解析一次
    this.allNewsPromise = null
  }

  async loadAllNews() {
    if (!this.allNewsPromise) {
      this.allNewsPromise = this._loadAllNews()
    }
    return this.allNewsPromise
  }

  async _loadAllNews() {
    const newsModules = import.meta.glob('../content/news/**/*.md', { query: '?raw', import: 'default' })
    const newsItems = []

    for (const [path, loader] of Object.entries(newsModules)) {
      try {
        const content = await loader()
        const processed = MarkdownProcessor.processFile(content)

        newsItems.push({
          ...processed,
          path: path.replace('../content/news/', '').replace('.md', ''),
          url: `/news/${processed.metadata.slug}`
        })
      } catch (error) {
        // 解析失败的文章打印并跳过，不阻塞其他新闻加载
        console.error(`Error processing ${path}:`, error)
      }
    }

    return newsItems.sort((a, b) =>
      new Date(b.metadata.date) - new Date(a.metadata.date)
    )
  }

  async getNewsBySlug(slug) {
    if (!slug) return null
    const newsItems = await this.loadAllNews()
    return newsItems.find(item => item.metadata.slug === slug) ?? null
  }
}

export default new NewsGenerator()
