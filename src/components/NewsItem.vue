<template>
  <li class="news-item">
    <router-link class="news-item-link" :to="{ name: 'NewsDetail', params: { slug: news.metadata.slug } }">
      <div class="news-main">
        <div class="news-title-row">
          <span v-if="news.metadata.source" class="repost-badge">转载</span>
          <span v-if="news.metadata.category" class="news-category">{{ news.metadata.category }}</span>
          <span class="news-title">{{ news.metadata.title }}</span>
        </div>
        <p v-if="summary" class="news-excerpt">{{ summary }}</p>
      </div>
      <time class="news-date" :datetime="news.metadata.date">
        {{ formatDate(news.metadata.date) }}
      </time>
    </router-link>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/date.js'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

const summary = computed(() => props.news.metadata.summary || props.news.excerpt || '')
</script>

<style scoped>
.news-item {
  border-bottom: 1px solid var(--color-border);
}

.news-item:last-child {
  border-bottom: none;
}

.news-item-link {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.9rem 0.75rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

/* hover 时左侧强调条 */
.news-item-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.6rem;
  bottom: 0.6rem;
  width: 3px;
  border-radius: 2px;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.news-item-link:hover {
  background-color: var(--color-primary-soft);
}

.news-item-link:hover::before {
  opacity: 1;
}

.news-main {
  flex: 1;
  min-width: 0;
}

.news-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.news-title {
  font-weight: 500;
  color: var(--color-text-strong);
}

.repost-badge {
  display: inline-block;
  font-size: 0.72em;
  line-height: 1.6;
  color: var(--color-accent);
  background: var(--color-primary-soft);
  border-radius: 999px;
  padding: 0 0.55em;
}

.news-category {
  display: inline-block;
  font-size: 0.72em;
  line-height: 1.6;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 0 0.4em;
}

.news-excerpt {
  margin: 0.3rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
  padding-top: 0.1rem;
}

@media (max-width: 768px) {
  .news-item-link {
    flex-direction: column;
    gap: 0.35rem;
  }

  .news-date {
    font-size: 0.8rem;
  }
}
</style>
