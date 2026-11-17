<template>
  <div class="not-found">
    <img class="watermark" :src="logo" alt="" aria-hidden="true" />
    <h1 class="code">404</h1>
    <p class="message">抱歉，您访问的页面不存在或已被移动。</p>
    <div class="actions">
      <button class="btn" @click="goBack">返回上一页</button>
      <router-link class="btn primary" to="/">回到首页</router-link>
    </div>
    <p class="quick-links">
      也可以直接前往
      <router-link to="/news">新闻动态</router-link>
      ·
      <router-link to="/guestbook">留言板</router-link>
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/img/logo.webp'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/')
  }
}
</script>

<style scoped>
.not-found {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
}

.watermark {
  position: absolute;
  width: min(420px, 70vw);
  height: auto;
  opacity: 0.07;
  pointer-events: none;
  user-select: none;
}

.code {
  position: relative;
  font-family: var(--font-display);
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1;
  margin: 0;
}

.message {
  position: relative;
  color: var(--color-text-muted);
  margin: 0;
}

.actions {
  position: relative;
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.6rem 1.4rem;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: var(--color-bg-card);
  color: var(--color-accent);
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn:hover {
  background: rgba(0, 91, 172, 0.06);
}

.btn.primary {
  background: var(--color-primary);
  color: #fff;
}

.btn.primary:hover {
  background: var(--color-primary-dark);
}

.quick-links {
  position: relative;
  margin: 1rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.quick-links a {
  color: var(--color-accent);
  text-decoration: none;
}

.quick-links a:hover {
  text-decoration: underline;
}
</style>
