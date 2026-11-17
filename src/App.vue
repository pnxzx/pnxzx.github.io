<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <Header />
  <main id="main-content" class="router-view">
    <router-view v-slot="{ Component, route }">
      <transition name="page">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </main>
  <Footer />
  <BackToTop />
  <transition name="fade">
    <div v-if="routeLoading" class="route-progress" aria-hidden="true"></div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import BackToTop from './components/BackToTop.vue'

const router = useRouter()
const routeLoading = ref(false)

// 懒加载路由切换时显示顶部进度条
router.beforeEach(() => {
  routeLoading.value = true
})

router.afterEach(() => {
  setTimeout(() => {
    routeLoading.value = false
  }, 200)
})
</script>

<style>
/* main 撑满剩余高度；页脚贴底 */
#app > .router-view {
  flex: 1;
}

main.router-view {
  display: block;
  position: relative;
  /* 正文至少占满一屏，页脚默认位于首屏之外，滚动到底才出现 */
  min-height: 100vh;
}

/* 路由加载进度条（懒加载 chunk 时） */
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 200;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  background-size: 50% 100%;
  background-repeat: no-repeat;
  animation: route-progress 0.9s linear infinite;
}

@keyframes route-progress {
  0% {
    background-position: -50% 0;
  }
  100% {
    background-position: 150% 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 路由切换动画：交叉淡入（离场页面脱离文档流，避免布局跳动） */
.page-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  transition: opacity 0.18s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
}
</style>
