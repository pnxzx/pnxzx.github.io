<template>
  <section class="news-list">
    <h2>新闻动态</h2>
    <ul>
      <NewsItem 
        v-for="item in news" 
        :key="item.id" 
        :news="item" 
      />
    </ul>
  </section>
</template>

<script setup>
import NewsItem from './NewsItem.vue'

const news = [
  { 
    id: 1, 
    title: '2025年秋季开学通知', 
    date: '2025-08-28',
    content: '根据教育局安排，我校将于9月1日正式开学...',
    author: '校办公室'
  },
  { 
    id: 2, 
    title: '我校学生在数学竞赛中获奖', 
    date: '2025-07-15',
    content: '在省级数学竞赛中，我校3名学生获得一等奖...',
    author: '教务处'
  },
  { 
    id: 3, 
    title: '校园安全教育活动圆满结束', 
    date: '2025-06-30',
    content: '为期两周的安全教育活动取得显著成效...',
    author: '保卫处'
  }
]
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
</style>
