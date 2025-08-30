<template>
  <li class="news-item">
    <span class="news-title">{{ news.title }}</span>
    <span class="news-date">{{ news.date }}</span>
  </li>
</template>

<script setup>
defineProps({ news: Object })
</script>

<style scoped>
.news-item { display: flex; justify-content: space-between; padding: 0.5em 0; border-bottom: 1px solid #eee; }
.news-title { font-weight: 500; }
.news-date { color: #888; font-size: 0.95em; }
</style>
