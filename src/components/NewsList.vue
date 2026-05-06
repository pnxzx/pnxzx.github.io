<template>
  <section class="news-list">
    <h2>新闻动态</h2>
    <ul>
      <NewsItem 
        v-for="item in pagedNews" 
        :key="item.id" 
        :news="item" 
      />
    </ul>

    <nav class="pagination" aria-label="新闻分页">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1" 
        @click="currentPage--"
        aria-label="上一页"
      >‹ 上一页</button>

      <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="currentPage = page"
        :aria-label="`第${page}页`"
        :aria-current="page === currentPage ? 'page' : undefined"
      >{{ page }}</button>

      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages" 
        @click="currentPage++"
        aria-label="下一页"
      >下一页 ›</button>
    </nav>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import NewsItem from './NewsItem.vue'
import allNews from '@/data/news.json'

const PAGE_SIZE = 5

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(allNews.length / PAGE_SIZE))

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return allNews.slice(start, start + PAGE_SIZE)
})
</script>

<style scoped>
.news-list {
  background: #fff;
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.news-list h2 {
  color: #005bac;
  margin-bottom: 1em;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  position: relative;
  padding-left: 1rem;
}

.news-list h2::before {
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.page-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #f0f6ff;
  border-color: #005bac;
  color: #005bac;
}

.page-btn.active {
  background: #005bac;
  color: #fff;
  border-color: #005bac;
  font-weight: 600;
  pointer-events: none;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

