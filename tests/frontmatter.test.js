import { describe, it, expect } from 'vitest'
import { parseFrontmatter, generateSlug } from '../src/utils/frontmatter.js'

describe('parseFrontmatter', () => {
  it('解析字符串、数字、布尔与内联数组', () => {
    const { data, content } = parseFrontmatter(
      '---\ntitle: "标题"\ncount: 3\nfeatured: true\ntags: ["a", "b"]\n---\n正文',
    )
    expect(data).toEqual({ title: '标题', count: 3, featured: true, tags: ['a', 'b'] })
    expect(content).toBe('正文')
  })

  it('兼容 CRLF 与 BOM', () => {
    const { data } = parseFrontmatter('\uFEFF---\r\ntitle: t\r\n---\r\nbody')
    expect(data.title).toBe('t')
  })

  it('无 frontmatter 时原样返回内容', () => {
    const { data, content } = parseFrontmatter('只有正文')
    expect(data).toEqual({})
    expect(content).toBe('只有正文')
  })

  it('值中包含中文冒号不会被截断', () => {
    const { data } = parseFrontmatter('---\nsummary: "说明：这是摘要"\n---\n')
    expect(data.summary).toBe('说明：这是摘要')
  })
})

describe('generateSlug', () => {
  it('保留中文并带日期前缀', () => {
    expect(generateSlug('2025年秋季开学通知', '2025-08-28')).toBe('2025-08-28-2025年秋季开学通知')
  })

  it('缺失字段时降级而不抛错', () => {
    expect(generateSlug(undefined, undefined)).toBe('undated-untitled')
  })

  it('非法日期降级为 undated', () => {
    expect(generateSlug('测试', 'not-a-date')).toBe('undated-测试')
  })
})
