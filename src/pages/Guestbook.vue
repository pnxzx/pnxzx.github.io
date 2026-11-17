<template>
  <section class="guestbook">
    <header class="guestbook-header">
      <h2 class="section-title">留言板</h2>
      <p class="guestbook-desc">
        欢迎留下你的想法与建议。发留言需登录 GitHub，支持 Markdown 与图片
        （可直接拖拽上传，或使用外链图床）。点击图片可查看大图。
      </p>
      <div class="guestbook-actions">
        <router-link class="primary-link" to="/guestbook/write">写留言</router-link>
        <button class="ghost-button" :disabled="loading" @click="load(true)">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </header>

    <div v-if="loading && messages.length === 0" class="placeholder-state">加载中...</div>

    <div v-else-if="error" class="placeholder-state">{{ error }}</div>

    <div v-else-if="messages.length === 0" class="empty-state">
      <p>还没有留言，来写第一条吧。</p>
      <router-link class="primary-link" to="/guestbook/write">写第一条留言</router-link>
    </div>

    <ol v-else class="message-list">
      <li v-for="message in visibleMessages" :key="message.id" class="message">
        <header class="message-head">
          <img class="message-avatar" :src="message.user?.avatar_url" alt="" loading="lazy" />
          <a
            class="message-author"
            :href="message.user?.html_url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ message.user?.login }}</a>
          <time class="message-time" :datetime="message.created_at">{{
            formatTime(message.created_at)
          }}</time>
        </header>

        <div
          class="message-body"
          @click="onContentClick"
          @keydown="onContentKeydown"
          v-html="message.html"
        ></div>

        <div v-if="message.child_comment_count > 0" class="message-replies">
          <button v-if="!message.replies" class="ghost-button" @click="loadReplies(message)">
            查看 {{ message.child_comment_count }} 条回复
          </button>
          <ul v-else class="reply-list">
            <li v-for="reply in message.replies" :key="reply.id" class="reply">
              <header class="message-head">
                <img
                  class="message-avatar small"
                  :src="reply.user?.avatar_url"
                  alt=""
                  loading="lazy"
                />
                <a
                  class="message-author"
                  :href="reply.user?.html_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ reply.user?.login }}</a>
                <time class="message-time" :datetime="reply.created_at">{{
                  formatTime(reply.created_at)
                }}</time>
              </header>
              <div class="message-body" v-html="reply.html"></div>
            </li>
          </ul>
          <p v-if="message.repliesError" class="reply-error">回复加载失败，请稍后重试。</p>
        </div>
      </li>
    </ol>

    <div v-if="hasMore" class="load-more">
      <button class="ghost-button" @click="visible += VISIBLE_STEP">加载更早的留言</button>
    </div>

    <ImageLightbox :src="lightbox.src" :alt="lightbox.alt" @close="closeLightbox" />
  </section>
</template>

<script setup>
// 留言板列表：读取固定 Discussion 的评论，按新→旧展示；发言在 /guestbook/write 的 giscus 中完成
import { ref, computed, onMounted } from 'vue'
import { DISCUSSIONS_API } from '@/config/site.js'
import {
  GUESTBOOK_DISCUSSION_NUMBER,
  COMMENTS_PAGE_SIZE,
  VISIBLE_STEP,
  CACHE_KEY,
  CACHE_TTL,
  REPLIES_API
} from '@/config/guestbook.js'
import { renderMarkdown } from '@/utils/renderMarkdown.js'
import { formatDate } from '@/utils/date.js'
import ImageLightbox from '@/components/ImageLightbox.vue'

const messages = ref([])
const loading = ref(true)
const error = ref('')
const visible = ref(VISIBLE_STEP)
const lightbox = ref({ src: '', alt: '' })

const visibleMessages = computed(() => messages.value.slice(0, visible.value))
const hasMore = computed(() => messages.value.length > visible.value)

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return `${formatDate(value)} ${time}`
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, items } = JSON.parse(raw)
    if (!Array.isArray(items) || Date.now() - ts > CACHE_TTL) return null
    return items
  } catch {
    return null
  }
}

function writeCache(items) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }))
  } catch {
    /* 隐私模式下写入失败，忽略 */
  }
}

async function fetchJson(url, failureMessage) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
  if (res.status === 403) throw new Error('GitHub API 限流中，请稍后再试')
  if (!res.ok) throw new Error(`${failureMessage} (HTTP ${res.status})`)
  return res.json()
}

async function fetchMessages() {
  const items = await fetchJson(
    `${DISCUSSIONS_API}/${GUESTBOOK_DISCUSSION_NUMBER}/comments?per_page=${COMMENTS_PAGE_SIZE}`,
    '加载留言失败'
  )
  return items
    .map((comment) => ({ ...comment, html: renderMarkdown(comment.body), replies: null }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

async function load(force = false) {
  loading.value = true
  error.value = ''
  try {
    if (!force) {
      const cached = readCache()
      if (cached) {
        messages.value = cached
        loading.value = false
      }
    }
    const list = await fetchMessages()
    messages.value = list
    writeCache(list)
    if (force) visible.value = VISIBLE_STEP
  } catch (e) {
    if (messages.value.length === 0) error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadReplies(message) {
  if (message.replies) return
  try {
    const items = await fetchJson(`${REPLIES_API(message.id)}?per_page=100`, '回复加载失败')
    message.replies = items.map((reply) => ({ ...reply, html: renderMarkdown(reply.body) }))
  } catch {
    message.repliesError = true
  }
}

function openLightbox(img) {
  lightbox.value = { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' }
}

function onContentClick(event) {
  const target = event.target
  if (!(target instanceof Element)) return
  const img = target.closest('img.md-image')
  if (img) openLightbox(img)
}

function onContentKeydown(event) {
  if (event.key !== 'Enter') return
  const target = event.target
  if (!(target instanceof Element)) return
  const img = target.closest('img.md-image')
  if (img) {
    event.preventDefault()
    openLightbox(img)
  }
}

function closeLightbox() {
  lightbox.value = { src: '', alt: '' }
}

onMounted(() => load())
</script>

<style scoped>
.guestbook {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem);
}

.guestbook-header {
  margin-bottom: 1.5rem;
}

.guestbook-header h2 {
  margin: 0 0 0.5rem;
}

.guestbook-desc {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1rem;
  line-height: 1.6;
}

.guestbook-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.45rem 1.1rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: 0.9rem;
}

.primary-link:hover {
  background: var(--color-primary-dark);
}

.ghost-button {
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
}

.ghost-button:hover:not(:disabled) {
  background: var(--color-bg-soft);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
  text-align: center;
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem 1.25rem;
}

.message-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.message-avatar.small {
  width: 22px;
  height: 22px;
}

.message-author {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  font-size: 0.92rem;
}

.message-author:hover {
  text-decoration: underline;
}

.message-time {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  margin-left: auto;
}

.message-body {
  line-height: 1.7;
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.message-body :deep(p) {
  margin: 0 0 0.5rem;
}

.message-body :deep(p:last-child) {
  margin-bottom: 0;
}

.message-body :deep(a) {
  color: var(--color-primary);
}

.message-body :deep(img) {
  display: block;
  max-width: 100%;
  max-height: 480px;
  width: auto;
  height: auto;
  margin: 0.5rem 0;
  border-radius: var(--radius-sm);
  cursor: zoom-in;
}

.message-body :deep(pre) {
  background: var(--color-bg-page);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  overflow-x: auto;
}

.message-body :deep(code) {
  font-family: monospace;
  font-size: 0.9em;
}

.message-replies {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--color-border);
}

.reply-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reply {
  padding-left: 0.75rem;
  border-left: 2px solid var(--color-border);
}

.reply-error {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
}

.load-more {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
