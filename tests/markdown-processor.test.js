// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import processor from '../src/utils/markdown-processor.js'

describe('markdown-processor', () => {
  it('解析完整文章并生成 slug/摘要/阅读时长', () => {
    const md = '---\ntitle: "测试文章"\ndate: "2025-08-28"\n---\n\n# 标题\n\n正文内容'
    const result = processor.processFile(md)
    expect(result.metadata.slug).toBe('2025-08-28-测试文章')
    expect(result.content).toContain('<h1>')
    expect(result.readingTime).toBeGreaterThanOrEqual(1)
  })

  it('中文阅读时长按字数估算', () => {
    const md = '---\ntitle: t\ndate: 2025-01-01\n---\n' + '这是一段中文内容。'.repeat(300)
    expect(processor.processFile(md).readingTime).toBeGreaterThan(3)
  })

  it('移除脚本与内联事件（XSS）', () => {
    const md = '---\ntitle: t\ndate: 2025-01-01\n---\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>'
    const html = processor.processFile(md).content
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('剥离 javascript: 链接', () => {
    const md = '---\ntitle: t\ndate: 2025-01-01\n---\n[点我](javascript:alert(1))'
    const html = processor.processFile(md).content
    expect(html).not.toContain('javascript:')
  })

  it('Bilibili av 号使用 aid 参数', () => {
    const md = '---\ntitle: t\ndate: 2025-01-01\n---\n@[video](https://www.bilibili.com/video/av12345)'
    const html = processor.processFile(md).content
    expect(html).toContain('aid=12345')
    expect(html).not.toContain('bvid=av')
  })
})
