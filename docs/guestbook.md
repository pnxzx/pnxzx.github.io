# 留言板技术文档

> 适用版本：`luuton-dev` 分支（留言板替代原论坛之后）
> 相关代码：[`src/pages/Guestbook.vue`](../src/pages/Guestbook.vue)、[`src/pages/GuestbookWrite.vue`](../src/pages/GuestbookWrite.vue)、[`src/utils/renderMarkdown.js`](../src/utils/renderMarkdown.js)、[`src/config/guestbook.js`](../src/config/guestbook.js)

## 1. 概述

留言板用于收集访客的想法、建议与校园回忆。整体采用 **纯静态前端 + GitHub Discussions + giscus** 架构：

- **读取**：浏览器经 GitHub REST API（匿名）拉取评论，自行渲染成留言流
- **写入**：内嵌 giscus 评论框，访客登录 GitHub 后发布，内容直接写入同一个 Discussion
- **零后端**：不依赖自建服务器，静态站点（GitHub Pages）即可运行

### 与非目标

| 是 | 不是 |
|---|---|
| 单页平铺的留言流，最新在前 | 多板块、多话题的论坛 |
| 固定一个 Discussion 承载全部留言 | 每条留言独立 Discussion |
| 读匿名、写需 GitHub 登录 | 匿名发言（需自建后端） |

## 2. 数据模型

所有留言存放在仓库的一个固定 Discussion 中（默认 `#17`），一条**评论 = 一条留言**，回复则是带 `parent_id` 的评论。

```
Discussion #17  「欢迎访问pnxzx.github.io」
├── Comment A (parent_id = null)          → 顶层留言
│   ├── Comment A-1 (parent_id = A.id)    → 对 A 的回复
│   └── Comment A-2 (parent_id = A.id)
└── Comment B (parent_id = null)          → 顶层留言
```

评论对象中与本功能相关的字段：

| 字段 | 含义 | 用途 |
|---|---|---|
| `id` | 评论数字 ID | 作为列表 key、回复分组键 |
| `parent_id` | 父评论 ID；顶层为 `null` | 区分留言与回复 |
| `body` | Markdown 原文 | 渲染正文 |
| `user.login` / `user.avatar_url` / `user.html_url` | 作者信息 | 展示昵称、头像、跳转主页 |
| `created_at` | 创建时间 | 排序与展示 |
| `child_comment_count` | 回复数量 | 判断是否需要展示回复区 |
| `html_url` | 该评论在 GitHub 的地址 | 兜底链接（分页未覆盖时） |

## 3. 架构与数据流

```
┌──────────────────────────── 读取（匿名） ────────────────────────────┐
│ Guestbook.vue                                                        │
│   GET api.github.com/repos/{owner}/{repo}/discussions/17/comments     │
│        ?per_page=100                                                 │
│        ↓                                                             │
│   按 parent_id 分组 → 顶层按时间倒序 / 回复按时间正序                  │
│        ↓                                                             │
│   renderMarkdown(body)  → 安全 HTML                                  │
│        ↓                                                             │
│   sessionStorage 缓存（60s）→ 渲染留言流                              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────── 写入（登录） ────────────────────────────┐
│ /guestbook/write                                                     │
│   giscus iframe（mapping=number, term=17）                            │
│        ↓ GitHub OAuth 授权                                           │
│   在评论框输入 Markdown → 发布                                        │
│        ↓                                                             │
│   GitHub 写入 Discussion #17 的评论                                   │
│        ↓                                                             │
│   返回 /guestbook，列表按同样接口读取到新留言                          │
└──────────────────────────────────────────────────────────────────────┘
```

### 为什么读写分离

giscus 的编辑器样式与交互固定，无法定制成留言流；而 giscus 又能免费解决最麻烦的部分——**GitHub OAuth 鉴权与写入**。因此让 giscus 只负责“写”，列表“读”由我们自己渲染，兼顾了视觉统一与零后端。

## 4. 组件与文件结构

| 文件 | 职责 |
|---|---|
| `src/pages/Guestbook.vue` | 留言列表：拉取、分组、排序、折叠、灯箱、缓存 |
| `src/pages/GuestbookWrite.vue` | 写留言页：文案说明 + 内嵌 giscus |
| `src/components/GiscusComment.vue` | giscus 封装：按 props 注入 `mapping/term`，配置缺失时降级 |
| `src/components/ImageLightbox.vue` | 轻量灯箱：遮罩、Esc 关闭、锁定滚动、查看原图 |
| `src/utils/renderMarkdown.js` | 共享渲染管线：marked → DOMPurify → 图片/链接后处理 |
| `src/config/guestbook.js` | 讨论编号、分页、缓存、折叠、图床黑名单 |

## 5. 关键实现

### 5.1 讨论绑定：按编号而非标题

写留言页使用 giscus 的 `number` 映射：

```html
<GiscusComment mapping="number" :term="17" />
```

相比 `title` 映射（依赖 `document.title`），`number` 映射更稳：**Discussion 改标题不会失联**，且不需要在挂载前改写页面标题。切换承载讨论时只需修改 `GUESTBOOK_DISCUSSION_NUMBER`。

### 5.2 回复分组（重要）

GitHub 的「列出讨论评论」接口**会把回复一并返回**，回复条目带有 `parent_id`。若不做分组，回复会作为普通留言出现在顶层（本项目早期版本即存在此问题）。

当前实现：

1. 拉取后先按 `parent_id` 建立 `Map<父ID, 回复[]>`；
2. 顶层列表只保留 `parent_id == null` 的评论；
3. 把对应回复挂到父留言的 `replies` 字段，按时间正序排序；
4. 顶层按时间倒序。

> 注意：**不要**调用 `/discussions/comments/{id}/replies`。该接口（以及单条评论接口）**要求认证**，匿名请求一律返回 404，这也曾是“回复加载失败”的根因。

### 5.3 回复折叠

| 常量 | 默认值 | 行为 |
|---|---|---|
| `REPLY_COLLAPSE_THRESHOLD` | `3` | 回复数 ≤ 3 时全部展示 |
| `REPLY_COLLAPSED_COUNT` | `2` | 超过阈值时先展示前 2 条，其余折叠 |

- 折叠态：显示前 2 条 + 「展开其余 N 条回复」
- 展开态：按钮变为「收起回复」，可再次折叠
- 展开状态存于组件内的 `reactive(Set<留言ID>)`，**不写入缓存**，刷新后回到折叠态
- 若因分页未取全（`replies.length < child_comment_count`），额外显示「在 GitHub 查看其余回复」

### 5.4 渲染管线

`renderMarkdown(markdown, { blacklist })` 的步骤：

1. `marked.parse`（GFM + 换行保留）
2. `DOMPurify.sanitize`，只允许 `https?://`、站内路径与 `#` 锚点
3. 后处理图片：
   - `http://` 自动升级为 `https://`（避免 HTTPS 页面被混合内容拦截）
   - 命中图床黑名单 → 替换为纯文本链接
   - 追加 `loading="lazy"`、`decoding="async"`、`referrerpolicy="no-referrer"`、`class="md-image"`、`tabindex="0"`、`role="button"`、`aria-label="查看大图"`
   - 移除 `width/height`，由 CSS 控制最大尺寸（`max-height: 480px`）
4. 后处理链接：统一 `target="_blank"` + `rel="noopener noreferrer"`

### 5.5 图片：支持方式与边界

giscus 的评论框**不支持上传文件**（其客户端没有任何上传逻辑），GitHub 的拖拽上传只是 github.com 编辑器的能力。因此支持两种写法：

| 方式 | 操作 | 托管位置 |
|---|---|---|
| 外链图床 | 粘贴 `![](https://host/a.jpg)` | 第三方图床 |
| GitHub 托管 | 点击写留言页的「在 GitHub 讨论页直接留言」，在 GitHub 上用编辑器拖拽上传 | GitHub CDN |

写留言页已按此文案说明，不再声称评论框可上传。

**图床黑名单**（`IMAGE_HOST_BLACKLIST`，默认空）：按域名匹配（含子域名），命中时图片替换为「[图片来自已屏蔽的图床]」链接，用于屏蔽追踪像素或恶意图床。

### 5.6 灯箱

- `ImageLightbox.vue` 通过 `Teleport` 挂到 `body`，避免被父容器 `overflow` 裁剪
- 关闭方式：点击遮罩、按 `Esc`、点击关闭按钮；同时锁定 `body` 滚动
- 提供「在新标签页查看原图」
- 留言正文与嵌套回复正文均通过事件委托绑定「点击 / Enter」打开

### 5.7 缓存

| 项 | 值 |
|---|---|
| 存储 | `sessionStorage` |
| key | `guestbook:comments:v1` |
| TTL | 60 秒 |
| 策略 | 先展示缓存（stale），再后台请求刷新（revalidate） |
| 不缓存 | 回复展开状态、灯箱状态 |

缓存的目的不是提速，而是**压低匿名 API 调用量**（限流见第 7 节）。写留言后返回列表会自动刷新（缓存过期或手动点「刷新」）。

### 5.8 SEO 与预渲染

- 路由：`/guestbook`、`/guestbook/write`
- 构建时由 `vite.config.js` 的预渲染步骤生成独立 HTML（含 title/description/OG/canonical）
- 运行时 `applyPageMeta` 同步更新 meta
- `sitemap.xml` 包含 `/guestbook`
- 旧论坛地址 `/forum`、`/forum/new`、`/forum/:number` 均重定向到留言板

## 6. 接口清单

| 用途 | 接口 | 认证 |
|---|---|---|
| 读取留言（含回复） | `GET /repos/{owner}/{repo}/discussions/17/comments?per_page=100` | 匿名可用 |
| 读取讨论列表（未使用） | `GET /repos/{owner}/{repo}/discussions` | 匿名可用 |
| 单条评论 | `GET .../discussions/17/comments/{id}` | **需认证**（匿名 404） |
| 回复列表 | `GET .../discussions/17/comments/{id}/replies` | **需认证**（匿名 404） |
| 写入留言/回复 | 由 giscus 经 GitHub App 完成 | GitHub OAuth |

`per_page` 上限为 100。超过 100 条时列表只显示最近 100 条顶层评论及其回复，可用「加载更早的留言」控制**前端展示条数**（不影响已取回的数据）。

## 7. 限流与失败处理

- 匿名 REST 限额：**60 次/小时/IP**
- 每次打开列表：1 次请求（缓存命中不请求）
- 命中限流（HTTP 403）→ 页面提示「GitHub API 限流中，请稍后再试」
- 讨论不存在或编号错误（HTTP 404）→ 显示加载失败
- 请求失败但存在缓存时：保留缓存内容，不打断浏览

## 8. 配置参考

全部集中在 [`src/config/guestbook.js`](../src/config/guestbook.js)：

| 常量 | 默认值 | 说明 |
|---|---|---|
| `GUESTBOOK_DISCUSSION_NUMBER` | `17` | 承载留言的 Discussion 编号 |
| `GUESTBOOK_TITLE` | `平南县中学留言板` | 页面展示标题 |
| `GUESTBOOK_DISCUSSION_URL` | 由仓库与编号拼接 | GitHub 讨论页直链 |
| `IMAGE_HOST_BLACKLIST` | `[]` | 图床黑名单（域名/子域名） |
| `COMMENTS_PAGE_SIZE` | `100` | REST 单页上限 |
| `VISIBLE_STEP` | `20` | 每次展示条数（加载更早） |
| `CACHE_KEY` / `CACHE_TTL` | `guestbook:comments:v1` / `60000` | 缓存键与有效期 |
| `REPLY_COLLAPSE_THRESHOLD` | `3` | 折叠阈值 |
| `REPLY_COLLAPSED_COUNT` | `2` | 折叠时展示条数 |

giscus 配置在 [`src/components/GiscusComment.vue`](../src/components/GiscusComment.vue)：仓库、仓库 ID、分类（Q&A）与分类 ID、主题、语言、输入框位置；`mapping`/`term` 由调用方通过 props 传入。

### 更换承载讨论

1. 在 GitHub 上创建（或选定）目标 Discussion，记下编号
2. 修改 `GUESTBOOK_DISCUSSION_NUMBER`
3. 确认 `GiscusComment` 的 `category` 与仓库设置一致
4. 重新构建部署（列表与写留言页会同时切换）

## 9. 安全设计

| 风险 | 措施 |
|---|---|
| 存储型 XSS（评论正文） | `DOMPurify` 白名单过滤；`ALLOWED_URI_REGEXP` 限制协议；脚本/事件属性被剥离 |
| 恶意链接协议 | `javascript:` 等非 http(s) 链接被移除 |
| 外链图片追踪 | `referrerpolicy="no-referrer"` + 可选图床黑名单 |
| 混合内容 | `http` 图片自动升级 `https` |
| 新窗口钓鱼 | `rel="noopener noreferrer"` |
| 图片撑破布局 | CSS 限宽 + 最大高度 |
| 内容治理 | 依赖 GitHub：评论可在讨论页删除/锁定；分类建议使用允许回帖的 Q&A |

> 说明：留言内容存储在 GitHub，删除与封禁在 GitHub 侧完成；站点本身不提供管理后台。

## 10. 已知限制

1. **必须登录 GitHub 才能发言**——giscus 机制决定，无法匿名。
2. **giscus 评论框不支持上传图片**——需外链图床，或到 GitHub 讨论页拖拽上传。
3. **无法自定义排序/置顶**——按创建时间排序；置顶只能在 GitHub 上调整（如选中回答）。
4. **单页最多 100 条**——超出部分需分页拉取（当前实现只取第一页，展示层再分页）。
5. **回复接口需认证**——不能按需拉取单条评论的回复，只能依赖列表接口的返回。
6. **giscus 主题跟随系统**——`preferred_color_scheme`，深色系统下评论框为深色，与站点浅色主题不完全一致，可改为 `light`。

## 11. 故障排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| 页面显示「还没有留言」 | 讨论为空，或编号不对 | 检查 `GUESTBOOK_DISCUSSION_NUMBER` 与 Discussions 页面 |
| 「GitHub API 限流中」 | 同 IP 一小时内超过 60 次 | 等一小时；确认缓存生效；避免频繁手动刷新 |
| 回复出现在顶层 | 未按 `parent_id` 分组 | 检查 `fetchMessages` 的分组逻辑 |
| 「回复加载失败」 | 调用了需认证的 replies 接口 | 已移除该调用；如需回复，从列表接口的返回中分组 |
| 图片不显示 | 图床防盗链、http 混合内容、图床已失效 | 换图床；确认链接为 https；检查黑名单 |
| 写留言页没有评论框 | giscus 配置缺失或分类 ID 不匹配 | 核对 repoId / categoryId；查看控制台报错 |
| 发布后列表没更新 | 缓存未过期 | 点「刷新」或等待 60 秒 |

## 12. 扩展方向

- **站内上传图片**：需要后端（或 Serverless）承接上传、鉴权、体积限制与防滥用；也可转存到 GitHub 仓库
- **匿名留言**：需服务端持 token 代发（Cloudflare Worker 等），并配套 Turnstile、频率限制与审核
- **通知**：可订阅 Discussion 的 GitHub 通知，或由 Action 推送到邮箱/群机器人
- **更好的分页**：按 `Link` 响应头翻页，支持超过 100 条留言
- **排序切换**：最新/最早/最热（需在本地排序，数据已具备）

## 13. 相关提交

| 提交 | 内容 |
|---|---|
| `b2b5b5d` | 留言板替代论坛，引入图片渲染、灯箱与黑名单 |
| `2a79d04` | 绑定固定讨论 #17（number 映射） |
| `77cea02` | 更正图片上传说明（giscus 不支持上传） |
| `2c242b6` | 回复按 `parent_id` 嵌套，移除需认证的回复接口调用 |
| （未提交） | 回复折叠阈值（3 / 2） |
