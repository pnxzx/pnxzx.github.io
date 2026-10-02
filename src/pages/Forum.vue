<template>
  <section class="forum-page">
    <header class="forum-header">
      <h2>交流论坛</h2>
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
        <li
          v-for="topic in discussions"
          :key="topic.number"
          class="topic-item"
          role="button"
          tabindex="0"
          @click="openTopic(topic.number)"
          @keydown.enter="openTopic(topic.number)"
        >
          <div class="topic-main">
            <span class="topic-title">{{ topic.title }}</span>
            <span v-if="topic.category" class="topic-category" :style="{ color: topic.category.color }">
              {{ topic.category.emoji }} {{ topic.category.name }}
            </span>
          </div>
          <div class="topic-meta">
            <img class="topic-avatar" :src="topic.user?.avatar_url" alt="" loading="lazy" />
            <span>{{ topic.user?.login }}</span>
            <span class="dot">·</span>
            <span>{{ formatDate(topic.created_at) }}</span>
          </div>
          <div class="topic-stats">
            <span>💬 {{ topic.comments }}</span>
          </div>
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
// 发帖跳转 GitHub 新建 Discussion 页；回帖由详情页内嵌 giscus 承载
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const REPO_OWNER = 'pnxzx'
const REPO_NAME = 'pnxzx.github.io'
const PER_PAGE = 20

const router = useRouter()
const discussions = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const hasMore = ref(false)

const newDiscussionUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/discussions/new/choose`

async function fetchDiscussions(pageNum) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/discussions?per_page=${PER_PAGE}&page=${pageNum}`
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
  } catch (e) {
    console.error(e)
  } finally {
    loadingMore.value = false
  }
}

const openTopic = (number) => router.push(`/forum/${number}`)

const formatDate = (s) => new Date(s).toLocaleDateString('zh-CN')

onMounted(async () => {
  try {
    const items = await fetchDiscussions(1)
    discussions.value = items
    hasMore.value = items.length === PER_PAGE
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.forum-page {
  max-width: 800px;
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem);
}

.forum-header h2 {
  color: #005bac;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  position: relative;
  padding-left: 1rem;
  margin: 0 0 0.5rem;
}

.forum-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background: currentColor;
  border-radius: 2px;
}

.forum-desc {
  color: #888;
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.forum-loading,
.forum-error,
.forum-empty {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.topic-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.topic-item:last-child {
  border-bottom: none;
}

.topic-item:hover {
  background: rgba(0, 91, 172, 0.04);
}

.topic-main {
  flex: 1;
  min-width: 0;
}

.topic-title {
  display: block;
  font-weight: 500;
  color: #333;
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
  color: #999;
  font-size: 0.8rem;
  white-space: nowrap;
}

.topic-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.dot {
  color: #ccc;
}

.topic-stats {
  color: #888;
  font-size: 0.85rem;
  white-space: nowrap;
}

.forum-more {
  text-align: center;
  margin-top: 1.5rem;
}

.more-button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #555;
}

.more-button:hover:not(:disabled) {
  background: #f5f5f5;
}

.forum-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.new-topic-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  color: #005bac;
  text-decoration: none;
  font-size: 0.95rem;
}

.action-divider {
  color: #ccc;
  margin: 0 0.25em;
}

.new-topic-link:hover {
  text-decoration: underline;
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
