<template>
  <div ref="container" class="giscus-wrapper">
    <div v-if="!configured" class="giscus-unconfigured">
      评论区功能配置中，敬请期待。
    </div>
  </div>
</template>

<script setup>
// giscus: 基于 GitHub Discussions 的评论组件
// https://giscus.app/zh-CN
// 配置缺失时优雅降级，不阻塞页面
import { ref, onMounted } from 'vue'

const container = ref(null)
const configured = ref(false)

// giscus 配置（https://giscus.app/zh-CN 生成，分类: Q&A）
const GISCUS_CONFIG = {
  repo: 'pnxzx/pnxzx.github.io',
  repoId: 'R_kgDOPm-QKw',
  category: 'Q&A', // 必须与 categoryId 对应的分类名一致，否则 giscus 报错
  categoryId: 'DIC_kwDOPm-QK84Cuzjw',
  mapping: 'title', // 按 document.title 匹配/创建讨论 —— 话题页挂载前需把标题设为话题名
  'input-position': 'top',
  lang: 'zh-CN',
  theme: 'preferred_color_scheme',
}

onMounted(() => {
  if (!GISCUS_CONFIG.repoId || !GISCUS_CONFIG.categoryId) return
  configured.value = true

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', GISCUS_CONFIG.repo)
  script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId)
  script.setAttribute('data-category', GISCUS_CONFIG.category)
  script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId)
  script.setAttribute('data-mapping', GISCUS_CONFIG.mapping)
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', GISCUS_CONFIG['input-position'])
  script.setAttribute('data-theme', GISCUS_CONFIG.theme)
  script.setAttribute('data-lang', GISCUS_CONFIG.lang)
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true
  container.value.appendChild(script)
})
</script>

<style scoped>
.giscus-wrapper {
  margin-top: 2.5rem;
}

.giscus-unconfigured {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.9rem;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>
