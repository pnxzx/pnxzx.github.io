<template>
  <section class="news-list">
    <div class="news-header">
      <h2 class="section-title">新闻动态</h2>
      <div class="news-controls">
        <select v-model="selectedCategory" @change="applyFilters">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <input
          v-model="searchQuery"
          @input="applyFilters"
          placeholder="搜索新闻..."
          class="search-input"
        />
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="filteredNews.length === 0" class="no-news">
      暂无新闻
    </div>
    
    <div v-else class="news-grid">
      <NewsItem 
        v-for="item in paginatedNews" 
        :key="item.metadata.slug" 
        :news="item" 
      />
    </div>
    
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
  gap: 1.5rem;
}

.loading,
.no-news {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
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
  border-color: var(--color-primary);
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
