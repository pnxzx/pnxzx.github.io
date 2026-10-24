// 新闻数据在构建期由 build/news-data-plugin.js 预编译为虚拟模块，
// 浏览器端不再解析 Markdown，也不再加载 marked/highlight.js/DOMPurify
import newsData from 'virtual:news-data'

class NewsGenerator {
  async loadAllNews() {
    return newsData
  }

  async getNewsBySlug(slug) {
    if (!slug) return null
    return newsData.find((item) => item.metadata.slug === slug) ?? null
  }
}

export default new NewsGenerator()
