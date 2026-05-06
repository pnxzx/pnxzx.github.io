// src/utils/markdown-processor.js
import { marked } from 'marked'
import matter from 'gray-matter'
import hljs from 'highlight.js'

class MarkdownProcessor {
  constructor() {
    this.setupMarked()
  }

  setupMarked() {
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value
        }
        return hljs.highlightAuto(code).value
      },
      breaks: true,
      gfm: true
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