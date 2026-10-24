// 站点级常量：仓库、域名、SEO 默认文案
export const REPO_OWNER = 'pnxzx'
export const REPO_NAME = 'pnxzx.github.io'
export const SITE_URL = 'https://pnxzx.github.io'
export const SITE_NAME = '平南县中学'
export const DEFAULT_TITLE = '平南县中学欢迎您'
export const SITE_DESCRIPTION =
  '平南县中学非官方网站：学校简介、新闻动态与联系方式。本站与学校官方无关联，信息仅供参考。'

export const GITHUB_REPO = `https://github.com/${REPO_OWNER}/${REPO_NAME}`
export const DISCUSSIONS_URL = `${GITHUB_REPO}/discussions`
// 仓库级新建讨论页，预选 Q&A 分类（q-a 为分类 slug）
export const NEW_DISCUSSION_URL = `${DISCUSSIONS_URL}/new?category=q-a`
export const DISCUSSIONS_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/discussions`
