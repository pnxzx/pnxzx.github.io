<template>
  <!-- 主视觉区域 -->
  <transition name="hero-exit">
    <section 
      v-if="!contentActive"
      class="hero-banner"
      :class="{ 'animate-up': isAnimating }"
    >
      <img
        src="@/assets/img/SchoolGate.jpg"
        alt="平南县中学全景"
        class="hero-image"
        @load="imageLoaded = true"
      >

      <div class="hero-content" :class="{ loaded: imageLoaded }">
        <h1 class="school-title">
          <span class="text-stroke">平南县中学</span>
        </h1>
        <p class="school-slogan">塑造一个最好的你</p>
        <button class="cta-button" @click="startAnimation">
          走进校园
          <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path d="M12 16 6 10h12z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </section>
  </transition>

  <!-- 内容区域 -->
  <transition name="content-enter">
    <section
      v-if="contentActive"
      class="content-section"
      ref="contentSection"
    >

      <div class="content-wrapper">
        <button class="back-button" @click="resetAnimation">
          <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path d="M12 8 18 14H6z" fill="currentColor" />
          </svg>
          返回
        </button>

        <header class="explore-header">
          <h2>欢迎探索平南县中学</h2>
          <p class="explore-sub">八榕苍翠 · 百年平中 · 自治区示范性普通高中</p>
        </header>

        <!-- 探索入口 -->
        <nav class="explore-grid" aria-label="站内导航">
          <router-link class="explore-card" to="/news">
            <span class="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em">
                <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Zm13 3h3v9a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
                <path d="M7 9h7M7 12.5h7M7 16h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </span>
            <span class="card-title">新闻动态</span>
            <span class="card-desc">通知公告与校园资讯</span>
          </router-link>

          <router-link class="explore-card" to="/forum">
            <span class="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em">
                <path d="M4 5h16v11H8l-4 4V5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
                <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </span>
            <span class="card-title">交流论坛</span>
            <span class="card-desc">校友与同学的讨论区</span>
          </router-link>

          <router-link class="explore-card" to="/contact">
            <span class="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em">
                <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
                <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="card-title">联系我们</span>
            <span class="card-desc">地址、电话与邮箱</span>
          </router-link>

          <router-link class="explore-card" to="/about">
            <span class="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em">
                <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="card-title">学校简介</span>
            <span class="card-desc">办学历史与传统</span>
          </router-link>
        </nav>

        <!-- 学校简介（复用 About 页的 SchoolIntro 真实内容） -->
        <SchoolIntro class="explore-intro" />
      </div>
    </section>
  </transition>

</template>

<script setup>
import { ref, nextTick } from 'vue'
import SchoolIntro from './SchoolIntro.vue'

const imageLoaded = ref(false)
const isAnimating = ref(false)
const contentActive = ref(false)
const contentSection = ref(null)

// URL 带 #explore 或 ?explore=1 时跳过主视觉直接进入内容区
if (window.location.hash === '#explore' || new URLSearchParams(window.location.search).has('explore')) {
  contentActive.value = true
}

const startAnimation = async () => {
  // 1. 触发动画状态
  isAnimating.value = true
  
  // 2. 等待动画完成 (800ms)
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 3. 切换内容显示
  contentActive.value = true
  
  // 4. 确保DOM更新后滚动
  await nextTick()
  contentSection.value.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  })
}

const resetAnimation = () => {
  contentActive.value = false
  isAnimating.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
/* 主视觉区域样式 */
.hero-banner {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 800px;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.33, 1, 0.68, 1);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  background: rgba(0, 91, 172, 0.4);
  opacity: 0;
  transition: opacity 0.6s ease 0.3s;
}

.hero-content.loaded {
  opacity: 1;
}

/* 按钮样式 */
.cta-button {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.9);
  color: #005bac;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 内容区域样式 */
.content-section {
  position: relative;
  min-height: 100vh;
  padding: 4rem 2rem;
  background: white;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

/* 探索入口 */
.explore-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.explore-header h2 {
  color: #005bac;
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin: 0 0 0.5rem;
}

.explore-sub {
  color: #888;
  font-size: 0.95rem;
  margin: 0;
  letter-spacing: 0.1em;
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.explore-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.4rem 0.75rem;
  background: #f6f8fa;
  border: 1px solid transparent;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.explore-card:hover {
  border-color: rgba(0, 91, 172, 0.35);
  background: rgba(0, 91, 172, 0.05);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 91, 172, 0.12);
}

.card-icon {
  color: #005bac;
  margin-bottom: 0.25rem;
}

.card-title {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.card-desc {
  color: #999;
  font-size: 0.8rem;
}

/* 简介区复用 SchoolIntro，去掉自带的灰底使其融入页面 */
.explore-intro {
  background: transparent;
  padding: 0;
}

.back-button {
  position: fixed;
  top: auto;
  right: 20px;
  padding: 8px 16px;
  background: #005bac;
  color: white;
  border: none;
  border-radius: 20px;
  z-index: 100;
  cursor: pointer;
}

/* 动画效果 */
.hero-exit-leave-active {
  position: absolute;
  width: 100%;
  z-index: 10;
}

.hero-exit-leave-to {
  opacity: 0;
  transform: translateY(-30%) scale(0.95);
}

.content-enter-enter-active,
.content-enter-leave-active {
  transition: all 0.8s cubic-bezier(0.33, 1, 0.68, 1);
}

.content-enter-enter-from {
  opacity: 0;
  transform: translateY(20%);
}

.content-enter-leave-to {
  opacity: 0;
  transform: translateY(10%);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-banner {
    height: 80vh;
  }

  .content-section {
    padding: 2rem 1rem;
  }

  .hero-exit-leave-to {
    transform: translateY(-15%) scale(0.97);
  }

  .explore-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 420px) {
  .explore-grid {
    grid-template-columns: 1fr;
  }
}

/* 文本样式 */
.school-title {
  font-size: clamp(2rem, 6vw, 4rem);
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
}

.text-stroke {
  -webkit-text-stroke: 1px white;
  color: transparent;
}

.school-slogan {
  font-size: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: 2rem;
}
</style>
