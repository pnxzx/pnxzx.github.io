<template>
  <section class="forum-page">
    <header class="forum-header">
      <h2 class="section-title">交流论坛</h2>
      <p class="forum-desc">
        基于 GitHub Discussions 的社区讨论区，发帖与回帖需登录 GitHub 账号。
      </p>
    </header>

    <div v-if="loading" class="forum-loading">加载中...</div>

    <div v-else-if="error" class="forum-error">
      {{ error }}
    </div>

    <template v-else>
      <div v-if="discussions.length === 0" class="forum-empty">
        暂无话题，快来发起第一个讨论吧！
        <router-link class="new-topic-link" to="/forum/new">
          <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          立即发帖
        </router-link>
      </div>

      <ul v-else class="topic-list">
        <li v-for="topic in discussions" :key="topic.number" class="topic-item">
          <router-link class="topic-item-link" :to="`/forum/${topic.number}`">
          <div class="topic-main">
            <span class="topic-title">{{ topic.title }}</span>
            <span v-if="topic.category" class="topic-category" :style="{ color: topic.category.color }">
              {{ topic.category.emoji }} {{ topic.category.name }}
            </span>
          </div>
          <div class="topic-meta">
            <template v-if="!isGiscusCreated(topic)">
              <img class="topic-avatar" :src="topic.user?.avatar_url" alt="" loading="lazy" />
              <span>{{ topic.user?.login }}</span>
            </template>
            <span v-else class="auto-label">站内发起</span>
            <span class="dot">·</span>
            <span>{{ formatDate(topic.created_at) }}</span>
          </div>
            <div class="topic-stats">
              <span>💬 {{ topic.comments }}</span>
            </div>
          </router-link>
        </li>
      </ul>

      <div v-if="hasMore" class="forum-more">
        <button class="more-button" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <div class="forum-actions">
        <router-link class="new-topic-link" to="/forum/new">
          <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          发起新话题
        </router-link>
        <span class="action-divider">·</span>
        <a
          class="new-topic-link"
          :href="newDiscussionUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          到 GitHub 发起
        </a>
      </div>
    </template>
  </section>
</template>

<script setup>
// 论坛列表页：读取仓库 GitHub Discussions（匿名 REST API，60次/小时/IP 限流）
// 用 sessionStorage 做 5 分钟缓存，先展示缓存再后台刷新，显著降低限流概率
import { ref, onMounted } from 'vue'
import { isGiscusCreated } from '@/utils/forum.js'
import { formatDate } from '@/utils/date.js'
import { DISCUSSIONS_API, NEW_DISCUSSION_URL } from '@/config/site.js'

const PER_PAGE = 20
const CACHE_KEY = 'forum:discussions:v1'
const CACHE_TTL = 5 * 60 * 1000

const discussions = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const hasMore = ref(false)

const newDiscussionUrl = NEW_DISCUSSION_URL

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
    /* 隐私模式等场景写入失败，忽略 */
  }
}

async function fetchDiscussions(pageNum) {
  const url = `${DISCUSSIONS_API}?per_page=${PER_PAGE}&page=${pageNum}`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' }
  })
  if (!res.ok) {
    // 403 通常是限流；404 是 Discussions 未开启
    if (res.status === 403) throw new Error('GitHub API 限流中，请稍后再试')
    throw new Error(`加载失败 (HTTP ${res.status})`)
  }
  return res.json()
}

async function loadMore() {
  loadingMore.value = true
  try {
    const items = await fetchDiscussions(page.value + 1)
    discussions.value.push(...items)
    page.value += 1
    hasMore.value = items.length === PER_PAGE
    writeCache(discussions.value)
  } catch (e) {
    console.error(e)
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  // 1) 先渲染缓存，避免白屏与重复请求
  const cached = readCache()
  if (cached) {
    discussions.value = cached
    hasMore.value = cached.length === PER_PAGE
    loading.value = false
  }
  // 2) 后台刷新
  try {
    const items = await fetchDiscussions(1)
    discussions.value = items
    hasMore.value = items.length === PER_PAGE
    writeCache(items)
  } catch (e) {
    if (!cached) error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.forum-page {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem);
}

.forum-header h2 {
  margin: 0 0 0.5rem;
}

.forum-desc {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.forum-loading,
.forum-error,
.forum-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.forum-empty {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.topic-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.topic-item {
  border-bottom: 1px solid var(--color-border);
}

.topic-item-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  color: inherit;
  text-decoration: none;
  transition: background 0.15s;
}

.topic-item:last-child {
  border-bottom: none;
}

.topic-item-link:hover {
  background: var(--color-primary-soft);
}

.topic-main {
  flex: 1;
  min-width: 0;
}

.topic-title {
  display: block;
  font-weight: 500;
  color: var(--color-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-category {
  display: inline-block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-text-faint);
  font-size: 0.8rem;
  white-space: nowrap;
}

.topic-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.dot {
  color: var(--color-text-faint);
}

.auto-label {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
  padding: 0.05em 0.5em;
}

.topic-stats {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

.forum-more {
  text-align: center;
  margin-top: 1.5rem;
}

.more-button {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);
}

.more-button:hover:not(:disabled) {
  background: var(--color-bg-soft);
}

.forum-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.new-topic-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.95rem;
}

.action-divider {
  color: var(--color-text-faint);
  margin: 0 0.25em;
}

@media (max-width: 600px) {
  .topic-meta span:not(:first-child) {
    display: none;
  }
  .topic-meta .dot {
    display: none;
  }
}
</style>
