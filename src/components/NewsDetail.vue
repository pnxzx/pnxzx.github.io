<template>
  <div class="news-page">
    <div class="reading-progress" :style="{ width: progress + '%' }" aria-hidden="true"></div>
    <article class="news-detail">
    <button class="back-button" @click="goBack">
      <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M16 4 8 12l8 8z" fill="currentColor" />
      </svg>
      返回新闻列表
    </button>

    <div v-if="loading" class="news-loading" aria-hidden="true">
      <div class="skeleton-line w-40"></div>
      <div class="skeleton-line w-80"></div>
      <div class="skeleton-line w-60"></div>
      <div class="skeleton-block"></div>
    </div>

    <div v-else-if="!currentNews" class="news-not-found">
      <h1>文章不存在</h1>
      <p>抱歉，您访问的新闻不存在或已被删除。</p>
    </div>

    <template v-else>
      <header class="news-header">
        <span v-if="currentNews.metadata.source" class="repost-banner">转载文章</span>
        <h1>{{ currentNews.metadata.title }}</h1>
        <div class="news-meta">
          <time :datetime="currentNews.metadata.date">{{ formatDateLong(currentNews.metadata.date) }}</time>
          <span>发布部门：{{ currentNews.metadata.author }}</span>
          <span v-if="currentNews.metadata.category" class="meta-chip">
            {{ currentNews.metadata.category }}
          </span>
          <span v-if="currentNews.readingTime" class="meta-dim">
            约 {{ currentNews.readingTime }} 分钟阅读
          </span>
          <button type="button" class="share-button" @click="shareLink">{{ shareLabel }}</button>
        </div>
      </header>

      <div class="news-content" @click="onContentClick" v-html="currentNews.content"></div>

      <footer v-if="currentNews.metadata.source" class="repost-footer">
        <p class="repost-notice">
          本文转载自微信公众号「{{ currentNews.metadata.author }}」，版权归原作者所有，内容仅供参考，请以官方发布为准。
        </p>
        <a
          class="source-link"
          :href="currentNews.metadata.source"
          target="_blank"
          rel="noopener noreferrer"
        >
          阅读原文
          <svg class="icon" viewBox="0 0 24 24" width="0.9em" height="0.9em" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </footer>

      <nav v-if="prevNews || nextNews" class="news-pager" aria-label="文章导航">
        <router-link
          v-if="prevNews"
          class="pager-item"
          :to="{ name: 'NewsDetail', params: { slug: prevNews.metadata.slug } }"
        >
          <span class="pager-label">上一篇</span>
          <span class="pager-title">{{ prevNews.metadata.title }}</span>
        </router-link>
        <router-link
          v-if="nextNews"
          class="pager-item pager-next"
          :to="{ name: 'NewsDetail', params: { slug: nextNews.metadata.slug } }"
        >
          <span class="pager-label">下一篇</span>
          <span class="pager-title">{{ nextNews.metadata.title }}</span>
        </router-link>
      </nav>

      <ImageLightbox :src="lightbox.src" :alt="lightbox.alt" @close="closeLightbox" />
    </template>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NewsGenerator from '@/utils/news-generator.js'
import { formatDate } from '@/utils/date.js'
import { applyPageMeta } from '@/utils/meta.js'
import ImageLightbox from './ImageLightbox.vue'

const router = useRouter()
const route = useRoute()

const currentNews = ref(null)
const loading = ref(true)
const progress = ref(0)
const prevNews = ref(null)
const nextNews = ref(null)
const lightbox = ref({ src: '', alt: '' })
const shareLabel = ref('复制链接')
let articleEl = null

function updateProgress() {
  if (!articleEl) return
  const rect = articleEl.getBoundingClientRect()
  const total = articleEl.offsetHeight - window.innerHeight
  const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1))
  progress.value = total > 0 ? Math.round((scrolled / total) * 100) : 0
}

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress, { passive: true })
  window.removeEventListener('resize', updateProgress)
})

onMounted(async () => {
  try {
    currentNews.value = await NewsGenerator.getNewsBySlug(route.params.slug)
    const list = await NewsGenerator.loadAllNews()
    const index = list.findIndex((item) => item.metadata.slug === route.params.slug)
    if (index > -1) {
      prevNews.value = index > 0 ? list[index - 1] : null
      nextNews.value = index < list.length - 1 ? list[index + 1] : null
    }
    const news = currentNews.value
    if (news) {
      applyPageMeta({
        title: `${news.metadata.title} - 平南县中学`,
        description: news.metadata.summary || news.metadata.excerpt,
        path: `/news/${news.metadata.slug}`,
        // 仅使用站点绝对路径或完整 URL 的封面；裸相对路径（src/assets）由构建哈希处理，不能直接拼域名
        image: /^(https?:|\/)/.test(news.metadata.cover || '') ? news.metadata.cover : undefined,
      })
    }
  } catch (error) {
    console.error('Failed to load news:', error)
  } finally {
    loading.value = false
  }

  await new Promise((resolve) => requestAnimationFrame(resolve))
  articleEl = document.querySelector('.news-detail')
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})

async function shareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    shareLabel.value = '已复制'
  } catch {
    shareLabel.value = '复制失败'
  }
  setTimeout(() => {
    shareLabel.value = '复制链接'
  }, 1800)
}

function onContentClick(event) {
  const target = event.target
  if (!(target instanceof Element)) return
  const img = target.closest('figure.news-image img')
  if (img) {
    lightbox.value = { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' }
  }
}

function closeLightbox() {
  lightbox.value = { src: '', alt: '' }
}

const goBack = () => {
  // 有浏览历史则返回，直达链接进来时回新闻列表而不是离开站点
  if (window.history.length > 1 && window.history.state?.back) {
    router.back()
  } else {
    router.replace('/news')
  }
}

const formatDateLong = (value) => formatDate(value, { long: true })
</script>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  z-index: 50;
  transition: width 0.1s linear;
}

.news-detail {
  max-width: var(--container-width);
  margin: 1.5rem auto;
  padding: clamp(1.25rem, 3vw, 2rem);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.news-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.news-header h1 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: var(--color-text-strong);
  margin-bottom: 0.5rem;
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.meta-chip {
  padding: 0 0.5em;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  font-size: 0.78em;
  color: var(--color-text-muted);
}

.meta-dim {
  font-size: 0.82em;
  color: var(--color-text-faint);
}

.share-button {
  margin-left: auto;
  padding: 0.2rem 0.7rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-button:hover {
  border-color: var(--color-primary-border);
  color: var(--color-accent);
}

.repost-banner {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--color-accent);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
  padding: 0.15em 0.7em;
  margin-bottom: 0.75rem;
}

.repost-footer {
  margin-top: 2.5rem;
  padding: 1rem 1.25rem;
  background: var(--color-bg-page);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.repost-notice {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.news-loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
}

.skeleton-line {
  height: 15px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--color-bg-soft) 25%,
    var(--color-border) 37%,
    var(--color-bg-soft) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-line.w-40 { width: 40%; }
.skeleton-line.w-60 { width: 60%; }
.skeleton-line.w-80 { width: 80%; }

.skeleton-block {
  height: 220px;
  margin-top: 0.5rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-soft) 25%,
    var(--color-border) 37%,
    var(--color-bg-soft) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.news-not-found {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.news-content {
  line-height: 1.8;
}

/* Image styles */
.news-content :deep(figure.news-image) {
  margin: 1.5rem 0;
  text-align: center;
}

.news-content :deep(figure.news-image img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  cursor: zoom-in;
}

.news-content :deep(figure.news-image figcaption) {
  margin-top: 0.5rem;
  font-size: 0.82rem;
  color: var(--color-text-faint);
}

/* Video embed styles */
.news-content :deep(.video-embed) {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  margin: 1.5rem 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: #000;
}

.news-content :deep(.video-embed iframe),
.news-content :deep(.video-embed video) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Code block styles */
.news-content :deep(pre) {
  background: var(--color-bg-page);
  border-radius: var(--radius-sm);
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.news-content :deep(code) {
  font-family: monospace;
  font-size: 0.9em;
}

.news-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.pager-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg-page);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background 0.2s;
}

.pager-item:hover {
  background: var(--color-bg-soft);
}

.pager-next {
  text-align: right;
}

.pager-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.pager-title {
  font-size: 0.9rem;
  color: var(--color-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .news-pager {
    grid-template-columns: 1fr;
  }

  .pager-next {
    text-align: left;
  }

  .news-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
