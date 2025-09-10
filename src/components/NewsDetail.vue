<template>
  <article class="news-detail">
    <button class="back-button" @click="router.back()">
      <i class="icon-arrow-left"></i> 返回新闻列表
    </button>
    
    <header class="news-header">
      <h1>{{ currentNews.title }}</h1>
      <div class="news-meta">
        <time :datetime="currentNews.date">{{ formatDate(currentNews.date) }}</time>
        <span>发布部门：{{ currentNews.author }}</span>
      </div>
    </header>

    <div class="news-content">
      <p>{{ currentNews.content }}</p>
      <!-- 实际项目中这里应该是富文本内容 -->
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import newsData from '@/data/news.json' // 或继续使用本地数据

const router = useRouter()
const route = useRoute()

const currentNews = computed(() => {
  return newsData.find(item => item.id === Number(route.params.id)) || {
    title: '文章不存在',
    content: '抱歉，您访问的新闻不存在或已被删除'
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

.news-content {
  line-height: 1.8;
}

@media (max-width: 768px) {
  .news-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
