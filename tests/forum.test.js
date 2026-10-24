import { describe, it, expect } from 'vitest'
import { isGiscusCreated } from '../src/utils/forum.js'

describe('isGiscusCreated', () => {
  it('识别 giscus 自动创建的讨论', () => {
    expect(
      isGiscusCreated({ user: { login: 'giscus[bot]' }, body: '# 标题\n\n描述' }),
    ).toBe(true)
  })

  it('普通用户的讨论不算', () => {
    expect(isGiscusCreated({ user: { login: 'luuton' }, body: '正文' })).toBe(false)
  })

  it('作者是机器人但正文不是元数据格式时不算', () => {
    expect(isGiscusCreated({ user: { login: 'giscus[bot]' }, body: '正常正文' })).toBe(false)
  })

  it('空值安全', () => {
    expect(isGiscusCreated(null)).toBe(false)
  })
})
