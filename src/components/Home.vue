<template>
  <!-- 主视觉区域 -->
  <transition name="hero-exit">
    <section 
      v-if="!contentActive"
      class="hero-banner"
      :class="{ 'animate-up': isAnimating }"
    >
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
          src="@/assets/img/SchoolGate.jpg"
          alt="平南县中学全景"
          class="hero-image"
          @load="imageLoaded = true"
        >
      </picture>

      <div class="hero-content" :class="{ loaded: imageLoaded }">
        <h1 class="school-title">
          <span class="text-stroke">平南县中学</span>
        </h1>
        <p class="school-slogan">塑造一个最好的你</p>
        <button class="cta-button" @click="startAnimation">
          走进校园 <i class="icon-arrow-down"></i>
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
        <i class="icon-arrow-up"></i> 返回
        </button>
        <h2>欢迎探索平南县中学</h2>
        <p>始建于1956年，省级示范性高中...</p>
        <!-- 其他内容区块 -->
      </div>
    </section>
  </transition>

</template>

<script setup>
import { ref, nextTick } from 'vue'

const imageLoaded = ref(false)
const isAnimating = ref(false)
const contentActive = ref(false)
const contentSection = ref(null)

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
