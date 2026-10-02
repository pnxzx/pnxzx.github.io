<template>
  <div class="not-found">
    <h1 class="code">404</h1>
    <p class="message">抱歉，您访问的页面不存在或已被移动。</p>
    <div class="actions">
      <button class="btn" @click="goBack">返回上一页</button>
      <router-link class="btn primary" to="/">回到首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

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
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
}

.code {
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 700;
  color: #005bac;
  line-height: 1;
  margin: 0;
}

.message {
  color: #666;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.6rem 1.4rem;
  border: 1px solid #005bac;
  border-radius: 4px;
  background: #fff;
  color: #005bac;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn:hover {
  background: rgba(0, 91, 172, 0.06);
}

.btn.primary {
  background: #005bac;
  color: #fff;
}

.btn.primary:hover {
  background: #004a8c;
}
</style>
