<template>
  <section class="news-list">
    <h2>新闻动态</h2>
    <ul>
      <NewsItem v-for="item in news" :key="item.id" :news="item" />
    </ul>
  </section>
</template>

<script setup>
import NewsItem from './NewsItem.vue'
const news = [
  { id: 1, title: '2025年秋季开学通知', date: '2025-08-28' },
  { id: 2, title: '我校学生在数学竞赛中获奖', date: '2025-07-15' },
  { id: 3, title: '校园安全教育活动圆满结束', date: '2025-06-30' }
]
</script>

<style scoped>
.news-list { background: #fff; padding: 2em; border-radius: 8px; }
.news-list h2 { color: #005bac; margin-bottom: 1em; }
.news-list ul { padding: 0; list-style: none; }
</style>
