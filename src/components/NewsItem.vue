<template>
  <li 
    class="news-item"
    @click="navigateToDetail"
    tabindex="0"
    @keydown.enter="navigateToDetail"
    role="article"
    aria-labelledby="news-title"
  >
    <span id="news-title" class="news-title">{{ news.title }}</span>
    <span class="news-date">{{ formatDate(news.date) }}</span>
  </li>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const navigateToDetail = () => {
  router.push({
    name: 'NewsDetail',
    params: { id: props.news.id }
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.news-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75em 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.news-item:hover {
  background-color: rgba(0, 91, 172, 0.05);
}

.news-item:active {
  transform: scale(0.98);
}

.news-title {
  font-weight: 500;
  flex: 1;
}

.news-date {
  color: #888;
  font-size: 0.95em;
  margin-left: 1em;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .news-item {
    flex-direction: column;
  }
  
  .news-date {
    margin-left: 0;
    margin-top: 0.25em;
    font-size: 0.85em;
  }
}
</style>
