<template>
  <li class="news-item">
    <router-link class="news-item-link" :to="{ name: 'NewsDetail', params: { slug: news.metadata.slug } }">
      <span class="news-title">
        <span v-if="news.metadata.source" class="repost-badge">转</span>
        {{ news.metadata.title }}
      </span>
      <span class="news-date">{{ formatDate(news.metadata.date) }}</span>
    </router-link>
  </li>
</template>

<script setup>
import { formatDate } from '@/utils/date.js'

defineProps({
  news: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.news-item {
  border-bottom: 1px solid var(--color-border);
}

.news-item-link {
  display: flex;
  justify-content: space-between;
  padding: 0.75em 0;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.news-item-link:hover {
  background-color: var(--color-primary-soft);
}

.news-item-link:active {
  transform: scale(0.98);
}

.news-title {
  font-weight: 500;
  flex: 1;
}

.repost-badge {
  display: inline-block;
  font-size: 0.75em;
  font-weight: 400;
  color: var(--color-primary);
  border: 1px solid currentColor;
  border-radius: 3px;
  padding: 0 0.35em;
  margin-right: 0.5em;
  vertical-align: 1px;
}

.news-date {
  color: var(--color-text-muted);
  font-size: 0.95em;
  margin-left: 1em;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .news-item-link {
    flex-direction: column;
  }

  .news-date {
    margin-left: 0;
    margin-top: 0.25em;
    font-size: 0.85em;
  }
}
</style>
