// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderMarkdown, isBlacklistedHost } from '../src/utils/renderMarkdown.js'

describe('renderMarkdown', () => {
  it('外部图片注入安全属性', () => {
    const html = renderMarkdown('![图](https://img.example.com/a.jpg)')
    expect(html).toContain('src="https://img.example.com/a.jpg"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('referrerpolicy="no-referrer"')
    expect(html).toContain('class="md-image"')
    expect(html).toContain('tabindex="0"')
  })

  it('http 图片升级为 https', () => {
    const html = renderMarkdown('![](http://img.example.com/a.png)')
    expect(html).toContain('src="https://img.example.com/a.png"')
  })

  it('黑名单图床替换为链接', () => {
    const html = renderMarkdown('![](https://tracker.example.com/pixel.gif)', {
      blacklist: ['example.com']
    })
    expect(html).not.toContain('<img')
    expect(html).toContain('已屏蔽的图床')
    expect(html).toContain('href="https://tracker.example.com/pixel.gif"')
  })

  it('链接新窗口打开且带 noopener', () => {
    const html = renderMarkdown('[链接](https://example.com)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('过滤脚本与事件属性', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('javascript: 链接被移除', () => {
    const html = renderMarkdown('[点我](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })
})

describe('isBlacklistedHost', () => {
  it('匹配域名及子域名', () => {
    expect(isBlacklistedHost('https://a.example.com/x.jpg', ['example.com'])).toBe(true)
    expect(isBlacklistedHost('https://example.com/x.jpg', ['example.com'])).toBe(true)
    expect(isBlacklistedHost('https://notexample.com/x.jpg', ['example.com'])).toBe(false)
  })

  it('空黑名单不拦截', () => {
    expect(isBlacklistedHost('https://example.com/x.jpg', [])).toBe(false)
  })
})
