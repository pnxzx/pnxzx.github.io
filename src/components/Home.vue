<template>
  <div class="home-page">
  <!-- 主视觉区域 -->
  <transition name="hero-exit">
    <section 
      v-if="!contentActive"
      class="hero-banner"
      :class="{ 'animate-up': isAnimating }"
      @mouseenter="stopSlideshow"
      @mouseleave="startSlideshow"
    >
      <div class="hero-slides">
        <img
          v-for="(slide, index) in slides"
          :key="slide.large"
          :src="slide.large"
          :srcset="`${slide.small} 800w, ${slide.large} 1600w`"
          sizes="100vw"
          width="1600"
          height="1067"
          :alt="slide.alt"
          class="hero-image"
          :class="{ active: index === activeSlide }"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          :loading="index === 0 ? 'eager' : 'lazy'"
          decoding="async"
          @load="onSlideLoad(index)"
        />
      </div>

      <div class="hero-dots" role="tablist" aria-label="校园照片切换">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          class="hero-dot"
          :class="{ active: index === activeSlide }"
          role="tab"
          :aria-selected="index === activeSlide"
          :aria-label="`查看第 ${index + 1} 张校园照片`"
          @click="setSlide(index)"
        ></button>
      </div>

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
      ref="contentSection"
      class="content-section"
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
          <ul class="explore-stats">
            <li><strong>1909</strong><span>建校年份</span></li>
            <li><strong>自治区</strong><span>示范性普通高中</span></li>
            <li><strong>八棵</strong><span>大榕树</span></li>
          </ul>
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

          <router-link class="explore-card" to="/guestbook">
            <span class="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em">
                <path d="M4 5h16v11H8l-4 4V5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
                <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </span>
            <span class="card-title">留言板</span>
            <span class="card-desc">留言与意见反馈</span>
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

        <!-- 最新动态 -->
        <section v-if="latestNews.length" class="news-preview">
          <div class="preview-head">
            <h3 class="section-title">最新动态</h3>
            <router-link class="preview-more" to="/news">查看全部 →</router-link>
          </div>
          <ul class="preview-list">
            <li v-for="item in latestNews" :key="item.metadata.slug">
              <router-link
                class="preview-item"
                :to="{ name: 'NewsDetail', params: { slug: item.metadata.slug } }"
              >
                <span class="preview-title">{{ item.metadata.title }}</span>
                <time class="preview-date">{{ formatDate(item.metadata.date) }}</time>
              </router-link>
            </li>
          </ul>
        </section>

        <!-- 校园掠影 -->
        <section class="campus-gallery">
          <h3 class="section-title">校园掠影</h3>
          <div class="gallery-track">
            <figure v-for="photo in gallery" :key="photo.caption" class="gallery-item">
              <img :src="photo.src" :alt="photo.caption" loading="lazy" decoding="async" />
              <figcaption>{{ photo.caption }}</figcaption>
            </figure>
          </div>
        </section>

        <!-- 学校简介（复用 About 页的 SchoolIntro 真实内容） -->
        <SchoolIntro class="explore-intro" />
      </div>
    </section>
  </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import SchoolIntro from './SchoolIntro.vue'
import hero1 from '@/assets/img/hero-1.webp'
import hero1Small from '@/assets/img/hero-1-800.webp'
import hero2 from '@/assets/img/hero-2.webp'
import hero2Small from '@/assets/img/hero-2-800.webp'
import hero3 from '@/assets/img/hero-3.webp'
import hero3Small from '@/assets/img/hero-3-800.webp'
import hero4 from '@/assets/img/hero-4.webp'
import hero4Small from '@/assets/img/hero-4-800.webp'
import campusDetail from '@/assets/img/campus-detail.webp'
import NewsGenerator from '@/utils/news-generator.js'
import { formatDate } from '@/utils/date.js'

const slides = [
  { large: hero1, small: hero1Small, alt: '平南县中学林荫校道' },
  { large: hero2, small: hero2Small, alt: '平南县中学校园鸟瞰' },
  { large: hero3, small: hero3Small, alt: '平南县中学林荫大道与放学学生' },
  { large: hero4, small: hero4Small, alt: '平南县中学校园与城市远景' }
]

const latestNews = ref([])
const gallery = [
  { src: hero2, caption: '校园鸟瞰' },
  { src: hero4, caption: '校园与城市远景' },
  { src: campusDetail, caption: '窗台上的新芽' }
]

const imageLoaded = ref(false)
const activeSlide = ref(0)
const isAnimating = ref(false)
const contentActive = ref(false)
const contentSection = ref(null)

let slideTimer = null
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onSlideLoad(index) {
  if (index === 0) imageLoaded.value = true
}

function setSlide(index) {
  activeSlide.value = index
}

function startSlideshow() {
  if (contentActive.value || prefersReducedMotion || slides.length < 2) return
  stopSlideshow()
  slideTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 6000)
}

function stopSlideshow() {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = null
  }
}

function onVisibilityChange() {
  if (document.hidden) stopSlideshow()
  else if (!contentActive.value) startSlideshow()
}

onMounted(async () => {
  startSlideshow()
  try {
    const all = await NewsGenerator.loadAllNews()
    latestNews.value = all.slice(0, 3)
  } catch {
    latestNews.value = []
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  stopSlideshow()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

// URL 带 #explore 或 ?explore=1 时跳过主视觉直接进入内容区
if (window.location.hash === '#explore' || new URLSearchParams(window.location.search).has('explore')) {
  contentActive.value = true
}

const startAnimation = async () => {
  stopSlideshow()
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
  startSlideshow()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
/* 主视觉区域样式 */
.hero-banner {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--header-height));
  height: calc(100svh - var(--header-height));
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.33, 1, 0.68, 1);
}

.hero-slides {
  position: absolute;
  inset: 0;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.hero-image.active {
  opacity: 1;
}

.hero-dots {
  position: absolute;
  left: 50%;
  bottom: 1.75rem;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.hero-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.25s ease;
}

.hero-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.hero-dot.active {
  width: 22px;
  border-radius: 4px;
  background: #fff;
}

.hero-content {
  position: absolute;
  z-index: 1;
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
  color: var(--color-accent);
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
  min-height: calc(100vh - var(--header-height));
  min-height: calc(100svh - var(--header-height));
  padding: 4rem 2rem;
  background: var(--color-bg-card);
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
  color: var(--color-accent);
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin: 0 0 0.5rem;
}

.explore-sub {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
  letter-spacing: 0.1em;
}

.explore-stats {
  display: flex;
  justify-content: center;
  gap: clamp(1.5rem, 6vw, 4rem);
  margin: 1.75rem 0 0;
  padding: 0;
  list-style: none;
}

.explore-stats li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.explore-stats strong {
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
  color: var(--color-accent);
}

.explore-stats span {
  font-size: 0.8rem;
  color: var(--color-text-muted);
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
  background: var(--color-bg-page);
  border: 1px solid transparent;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.explore-card:hover {
  border-color: var(--color-primary-border);
  background: var(--color-primary-soft);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 91, 172, 0.12);
}

.card-icon {
  color: var(--color-accent);
  margin-bottom: 0.25rem;
}

.card-title {
  font-weight: 600;
  color: var(--color-text-strong);
  font-size: 0.95rem;
}

.card-desc {
  color: var(--color-text-faint);
  font-size: 0.8rem;
}

/* 简介区复用 SchoolIntro，去掉自带的灰底使其融入页面 */
.news-preview {
  margin-bottom: 2.5rem;
}

.preview-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.preview-head .section-title {
  margin: 0;
}

.preview-more {
  color: var(--color-accent);
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
}

.preview-more:hover {
  text-decoration: underline;
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
}

.preview-list li {
  border-bottom: 1px solid var(--color-border);
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.25rem;
  color: var(--color-text);
  text-decoration: none;
  transition: background 0.2s;
}

.preview-item:hover {
  background: var(--color-primary-soft);
}

.preview-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-date {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  white-space: nowrap;
}

.campus-gallery {
  margin-bottom: 2.5rem;
}

.campus-gallery .section-title {
  margin: 0 0 0.9rem;
}

.gallery-track {
  display: flex;
  gap: 0.9rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scroll-snap-type: x mandatory;
}

.gallery-item {
  flex: 0 0 260px;
  margin: 0;
  scroll-snap-align: start;
}

.gallery-item img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.gallery-item figcaption {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.explore-intro {
  background: transparent;
  padding: 0;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.45rem 1rem;
  margin-bottom: 1rem;
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: var(--color-border);
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
    height: calc(100vh - var(--header-height));
    height: calc(100svh - var(--header-height));
  }

  .content-section {
    padding: 2rem 1rem;
  }

  .hero-exit-leave-to {
    transform: translateY(-15%) scale(0.97);
  }

  .explore-stats {
  display: flex;
  justify-content: center;
  gap: clamp(1.5rem, 6vw, 4rem);
  margin: 1.75rem 0 0;
  padding: 0;
  list-style: none;
}

.explore-stats li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.explore-stats strong {
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
  color: var(--color-accent);
}

.explore-stats span {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.explore-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 420px) {
  .explore-stats {
  display: flex;
  justify-content: center;
  gap: clamp(1.5rem, 6vw, 4rem);
  margin: 1.75rem 0 0;
  padding: 0;
  list-style: none;
}

.explore-stats li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.explore-stats strong {
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
  color: var(--color-accent);
}

.explore-stats span {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.explore-grid {
    grid-template-columns: 1fr;
  }
}

/* 文本样式 */
.school-title {
  font-family: var(--font-display);
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
