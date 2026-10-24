import { describe, it, expect } from 'vitest'
import { formatDate } from '../src/utils/date.js'

describe('formatDate', () => {
  it('短格式', () => {
    expect(formatDate('2025-08-28')).toBe('2025/8/28')
  })

  it('长格式包含年月日', () => {
    expect(formatDate('2025-08-28', { long: true })).toContain('2025年')
  })

  it('非法日期返回空串', () => {
    expect(formatDate('bad')).toBe('')
  })
})
