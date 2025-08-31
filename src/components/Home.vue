<template>
  <!-- 大图展示区 -->
  <section class="hero-banner">
    <!-- 响应式图片 + 预加载 -->
    <picture>
      <source 
        media="(max-width: 768px)" 
        srcset="@/assets/img/SchoolGate.jpg"
      >
      <source 
        media="(min-width: 769px)" 
        srcset="@/assets/img/SchoolGate.jpg"
      >
      <img
        ref="heroImage"
        src="@/assets/img/SchoolGate.jpg"
        alt="平南县中学全景：现代化教学楼与绿树成荫的校园环境"
        class="hero-image"
        @load="handleImageLoad"
      >
    </picture>

    <!-- 文字遮罩层 -->
    <div class="hero-content" :class="{ loaded: imageLoaded }">
      <h1 class="school-title">
        <span class="text-stroke">平南县中学</span>
      </h1>
      <p class="school-slogan">厚德博学 · 求实创新</p>
      <button class="cta-button" @click="scrollToContent">
        走进校园 <i class="icon-arrow-down"></i>
      </button>
    </div>

    <!-- 加载指示器 -->
    <div v-if="!imageLoaded" class="loading-placeholder">
      <div class="loading-spinner"></div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const heroImage = ref(null)
const imageLoaded = ref(false)

const handleImageLoad = () => {
  imageLoaded.value = true
  // 可以在这里添加GSAP动画触发
}

const scrollToContent = () => {
  window.scrollTo({
    top: document.documentElement.clientHeight,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
/* 核心样式 */
.hero-banner {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 800px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  transition: opacity 0.8s ease;
  opacity: v-bind('imageLoaded ? 1 : 0');
}

/* 文字内容样式 */
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
  background: rgba(0, 91, 172, 0.4); /* 校徽蓝透明层 */
  opacity: 0;
  transition: opacity 0.6s ease 0.3s;
}

.hero-content.loaded {
  opacity: 1;
}

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

/* 加载动画 */
.loading-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: grid;
  place-items: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 91, 172, 0.2);
  border-top-color: #005bac;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-banner {
    height: 80vh;
  }
  
  .hero-content {
    padding: 0 20px;
  }
}
</style>
