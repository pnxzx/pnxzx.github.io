<template>
  <article class="forum-topic">
    <button class="back-button" @click="goBack">
      <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M16 4 8 12l8 8z" fill="currentColor" />
      </svg>
      返回话题列表
    </button>

    <div v-if="loading" class="topic-loading">加载中...</div>

    <div v-else-if="error" class="topic-error">{{ error }}</div>

    <template v-else-if="topic">
      <header class="topic-header">
        <h1>{{ topic.title }}</h1>
        <div class="topic-meta">
          <img class="avatar" :src="topic.user?.avatar_url" alt="" />
          <a
            class="author"
            :href="topic.user?.html_url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ topic.user?.login }}</a>
          <span class="dot">·</span>
          <time :datetime="topic.created_at">{{ formatDate(topic.created_at) }}</time>
          <span v-if="topic.category" class="dot">·</span>
          <span v-if="topic.category" class="category">{{ topic.category.emoji }} {{ topic.category.name }}</span>
        </div>
      </header>

      <div class="topic-body markdown-body" v-html="renderedBody"></div>

      <div class="topic-github-link">
        <a
          :href="topic.html_url"
          target="_blank"
          rel="noopener noreferrer"
        >在 GitHub 上查看此话题 ↗</a>
      </div>

      <!-- 回帖区：giscus（登录 GitHub 后可评论） -->
      <GiscusComment />
    </template>
  </article>
</template>

<script setup>
// 话题详情页：正文来自 Discussions REST API（1F），回帖由 giscus 承载
// giscus mapping=title 按 document.title 匹配讨论，因此加载话题后
// 必须先把 document.title 设为话题标题，giscus 才会绑定到正确的讨论串
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import GiscusComment from '@/components/GiscusComment.vue'

const REPO_OWNER = 'pnxzx'
const REPO_NAME = 'pnxzx.github.io'

const route = useRoute()
const router = useRouter()

const topic = ref(null)
const loading = ref(true)
const error = ref('')

// marked 基本配置（论坛内容同样需要 XSS 过滤）
marked.setOptions({ breaks: true, gfm: true, async: false })

const renderedBody = computed(() => {
  if (!topic.value) return ''
  return DOMPurify.sanitize(marked.parse(topic.value.body || ''), {
    ALLOWED_URI_REGEXP: /^(?:https?:|\/(?!\/)|#)/,
  })
})

async function loadTopic(number) {
  loading.value = true
  error.value = ''
  topic.value = null
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/discussions/${number}`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )
    if (res.status === 404) throw new Error('话题不存在或已被删除')
    if (res.status === 403) throw new Error('GitHub API 限流中，请稍后再试')
    if (!res.ok) throw new Error(`加载失败 (HTTP ${res.status})`)
    topic.value = await res.json()
    // giscus mapping=title：先设置 document.title 再渲染 giscus，
    // 使评论区绑定到与本话题同名的 Discussion
    document.title = topic.value.title
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1 && window.history.state?.back) {
    router.back()
  } else {
    router.replace('/forum')
  }
}

const formatDate = (s) => new Date(s).toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric'
})

onMounted(() => loadTopic(route.params.number))
watch(() => route.params.number, (n) => { if (n && route.name === 'ForumTopic') loadTopic(n) })
</script>

<style scoped>
.forum-topic {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: #eee;
}

.topic-loading,
.topic-error {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.topic-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.topic-header h1 {
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  color: #333;
  margin: 0 0 0.75rem;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.author {
  color: #005bac;
  text-decoration: none;
  font-weight: 500;
}

.author:hover {
  text-decoration: underline;
}

.dot {
  color: #ccc;
}

.category {
  color: #888;
}

.topic-body {
  line-height: 1.8;
  color: #333;
}

.topic-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.topic-body :deep(pre) {
  background: #f6f8fa;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
}

.topic-body :deep(code) {
  font-family: monospace;
  font-size: 0.9em;
}

.topic-body :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  border-left: 3px solid #005bac;
  background: #f7f9fb;
  color: #555;
}

.topic-github-link {
  margin-top: 2rem;
  font-size: 0.9rem;
}

.topic-github-link a {
  color: #005bac;
  text-decoration: none;
}

.topic-github-link a:hover {
  text-decoration: underline;
}
</style>
