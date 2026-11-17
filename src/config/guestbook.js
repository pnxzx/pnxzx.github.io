// 留言板配置
import { REPO_OWNER, REPO_NAME } from './site.js'

// 固定讨论标题：giscus（mapping=title）据此创建/绑定，列表页据此查找
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
