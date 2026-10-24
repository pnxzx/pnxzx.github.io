// src/utils/forum.js
// giscus 站内自动创建的讨论识别：
// - 作者是 giscus[bot]
// - 正文由页面元数据生成，固定以 "# {页面标题}" 开头
// 这类讨论的"正文"是垃圾元数据，真实内容在第一条评论里。
export function isGiscusCreated(discussion) {
  if (!discussion) return false
  const login = discussion.user?.login || ''
  if (login !== 'giscus[bot]') return false
  return (discussion.body || '').trimStart().startsWith('# ')
}
