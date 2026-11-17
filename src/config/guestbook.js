// 留言板配置
import { REPO_OWNER, REPO_NAME } from './site.js'

// 留言板承载讨论：仓库中「欢迎访问pnxzx.github.io」的编号（#17）
// 列表页直接按编号取评论；写留言页用 giscus number 映射绑定，重命名标题也不会失联
export const GUESTBOOK_DISCUSSION_NUMBER = 17

// 页面展示用标题
export const GUESTBOOK_TITLE = '平南县中学留言板'

// 图床黑名单：按域名匹配（含子域名）。
// 命中时该图片会被替换为普通链接，避免追踪像素或恶意图床。
// 预留为空数组，需要时追加域名即可，例如：'tracker.example.com'
export const IMAGE_HOST_BLACKLIST = []

export const COMMENTS_PAGE_SIZE = 100 // REST 单页上限
export const VISIBLE_STEP = 20 // 每次展示多少条
export const CACHE_KEY = 'guestbook:comments:v1'
export const CACHE_TTL = 60 * 1000 // 1 分钟

export const REPLIES_API = (commentId) =>
  `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/discussions/comments/${commentId}/replies`
