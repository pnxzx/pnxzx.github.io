<template>
  <article class="news-detail">
    <button class="back-button" @click="router.back()">
      <i class="icon-arrow-left"></i> 返回新闻列表
    </button>

    <div v-if="loading" class="news-loading">加载中...</div>

    <div v-else-if="!currentNews" class="news-not-found">
      <h1>文章不存在</h1>
      <p>抱歉，您访问的新闻不存在或已被删除。</p>
    </div>

    <template v-else>
      <header class="news-header">
        <h1>{{ currentNews.metadata.title }}</h1>
        <div class="news-meta">
          <time :datetime="currentNews.metadata.date">{{ formatDate(currentNews.metadata.date) }}</time>
          <span>发布部门：{{ currentNews.metadata.author }}</span>
        </div>
      </header>

      <div class="news-content" v-html="currentNews.content"></div>
    </template>
  </article>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NewsGenerator from '@/utils/news-generator.js'

const router = useRouter()
const route = useRoute()

const currentNews = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    currentNews.value = await NewsGenerator.getNewsBySlug(route.params.slug)
  } catch (error) {
    console.error('Failed to load news:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.news-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
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

.news-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.news-header h1 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #333;
  margin-bottom: 0.5rem;
}

.news-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.news-loading,
.news-not-found {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
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
  border-radius: 4px;
}

.news-content :deep(figure.news-image figcaption) {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #888;
}

/* Video embed styles */
.news-content :deep(.video-embed) {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  margin: 1.5rem 0;
  overflow: hidden;
  border-radius: 4px;
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
  background: #f6f8fa;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.news-content :deep(code) {
  font-family: monospace;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .news-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
