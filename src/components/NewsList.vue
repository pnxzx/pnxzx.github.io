<template>
  <section class="news-list">
    <div class="news-header">
      <h2 class="section-title">新闻动态</h2>
      <div class="news-controls">
        <select v-model="selectedCategory" aria-label="按分类筛选新闻" @change="applyFilters">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <input
          v-model="searchQuery"
          placeholder="搜索新闻..."
          aria-label="搜索新闻标题、摘要或标签"
          class="search-input"
          @input="applyFilters"
        />
      </div>
    </div>
    
    <div v-if="loading" class="skeleton-list" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="skeleton-row">
        <div class="skeleton-line w-70"></div>
        <div class="skeleton-line w-45"></div>
      </div>
    </div>

    <div v-else-if="filteredNews.length === 0" class="no-news">
      <svg class="empty-icon" viewBox="0 0 24 24" width="2.2em" height="2.2em" aria-hidden="true">
        <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Zm13 3h3v9a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M7 9h7M7 12.5h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <p>{{ hasFilters ? '没有符合条件的新闻' : '暂无新闻' }}</p>
      <button v-if="hasFilters" class="empty-action" @click="clearFilters">清除筛选</button>
    </div>
    
    <ul v-else class="news-grid">
      <NewsItem 
        v-for="item in paginatedNews" 
        :key="item.metadata.slug" 
        :news="item" 
      />
    </ul>
    
    <div v-if="totalPages > 1" class="pagination">
      <button 
        v-for="page in totalPages" 
        :key="page"
        :class="{ active: page === currentPage }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NewsItem from './NewsItem.vue'
import NewsGenerator from '../utils/news-generator.js'

const news = ref([])
const filteredNews = ref([])
const loading = ref(true)
const selectedCategory = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const hasFilters = computed(() => Boolean(selectedCategory.value || searchQuery.value.trim()))

function clearFilters() {
  selectedCategory.value = ''
  searchQuery.value = ''
}

const categories = computed(() => {
  const cats = new Set(news.value.map(item => item.metadata.category))
  return Array.from(cats).sort()
})

const totalPages = computed(() => {
  return Math.ceil(filteredNews.value.length / itemsPerPage)
})

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNews.value.slice(start, end)
})

async function loadNews() {
  try {
    loading.value = true
    news.value = await NewsGenerator.loadAllNews()
    filteredNews.value = news.value
  } catch (error) {
    console.error('Failed to load news:', error)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  let result = news.value

  if (selectedCategory.value) {
    result = result.filter(item => item.metadata.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.trim().toLowerCase()
    result = result.filter(item =>
      item.metadata.title.toLowerCase().includes(term) ||
      (item.metadata.summary && item.metadata.summary.toLowerCase().includes(term)) ||
      (item.metadata.tags && item.metadata.tags.some(tag => tag.toLowerCase().includes(term)))
    )
  }

  filteredNews.value = result
  currentPage.value = 1
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-list {
  max-width: var(--container-width-wide);
  margin: 0 auto;
  background: var(--color-bg-card);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.news-header h2 {
  margin: 0;
}

.news-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.news-controls select,
.search-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.search-input {
  width: 200px;
}

.news-grid {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.no-news {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.no-news p {
  margin: 0;
}

.no-news .empty-icon {
  color: var(--color-text-faint);
}

.empty-action {
  margin-top: 0.25rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: 0.85rem;
  cursor: pointer;
}

.empty-action:hover {
  background: var(--color-bg-soft);
}

/* 骨架屏 */
.skeleton-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-line {
  height: 14px;
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

.skeleton-line.w-70 {
  width: 70%;
}

.skeleton-line.w-45 {
  width: 45%;
  height: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.pagination button:hover {
  background: var(--color-bg-soft);
}

.pagination button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-accent);
}

@media (max-width: 768px) {
  .news-header {
    flex-direction: column;
    align-items: stretch;
  }

  .news-controls {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }
}
</style>
