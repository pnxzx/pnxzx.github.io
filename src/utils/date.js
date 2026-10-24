// 统一日期格式化（全站唯一的日期展示逻辑）
export function formatDate(value, { long = false } = {}) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return long
    ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : date.toLocaleDateString('zh-CN')
}
