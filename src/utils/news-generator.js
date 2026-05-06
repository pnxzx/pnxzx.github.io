// src/utils/news-generator.js
import MarkdownProcessor from './markdown-processor.js'

class NewsGenerator {
  constructor() {
    this.newsCache = new Map()
  }

  async loadAllNews() {
    const newsModules = import.meta.glob('../content/news/**/*.md', { as: 'raw' })
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
        console.error(`Error processing ${path}:`, error)
      }
    }

    return newsItems.sort((a, b) => 
      new Date(b.metadata.date) - new Date(a.metadata.date)
    )
  }

  async getNewsBySlug(slug) {
    if (this.newsCache.has(slug)) {
      return this.newsCache.get(slug)
    }

    try {
      const newsItems = await this.loadAllNews()
      const newsItem = newsItems.find(item => item.metadata.slug === slug)
      
      if (newsItem) {
        this.newsCache.set(slug, newsItem)
        return newsItem
      }
    } catch (error) {
      console.error(`Error loading news item ${slug}:`, error)
    }

    return null
  }

  async getFeaturedNews(limit = 5) {
    const allNews = await this.loadAllNews()
    return allNews
      .filter(item => item.metadata.featured)
      .slice(0, limit)
  }

  async getNewsByCategory(category, limit = 10) {
    const allNews = await this.loadAllNews()
    return allNews
      .filter(item => item.metadata.category === category)
      .slice(0, limit)
  }

  async searchNews(query, limit = 10) {
    const allNews = await this.loadAllNews()
    const searchTerm = query.toLowerCase()
    
    return allNews
      .filter(item => 
        item.metadata.title.toLowerCase().includes(searchTerm) ||
        item.metadata.summary.toLowerCase().includes(searchTerm) ||
        item.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit)
  }
}

export default new NewsGenerator()