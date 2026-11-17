<template>
  <article class="guestbook-write">
    <router-link class="back-button" to="/guestbook">
      <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M16 4 8 12l8 8z" fill="currentColor" />
      </svg>
      返回留言板
    </router-link>

    <h1 class="section-title">写留言</h1>
    <p class="write-desc">
      留言保存在项目的 GitHub Discussions 中。发布需要登录 GitHub 账号（首次会弹出授权窗口）。
    </p>

    <ul class="write-tips">
      <li>支持 Markdown：**加粗**、列表、链接等。</li>
      <li>插入图片：<strong>直接把图片拖拽或粘贴到评论框</strong>，GitHub 会自动托管。</li>
      <li>也可以使用外链图床：<code>![](https://example.com/photo.jpg)</code></li>
      <li>点击留言中的图片可查看大图。</li>
    </ul>

    <GiscusComment />
  </article>
</template>

<script setup>
import { onUnmounted } from 'vue'
import GiscusComment from '@/components/GiscusComment.vue'
import { GUESTBOOK_TITLE } from '@/config/guestbook.js'
import { applyPageMeta } from '@/utils/meta.js'

const previousTitle = document.title

// giscus（mapping=title）按 document.title 绑定讨论：
// 使用固定标题，保证所有留言都进入同一个留言板讨论
document.title = GUESTBOOK_TITLE
applyPageMeta({
  title: GUESTBOOK_TITLE,
  description: '平南县中学留言板：留下你的想法与建议。',
  path: '/guestbook/write'
})

onUnmounted(() => {
  document.title = previousTitle
})
</script>

<style scoped>
.guestbook-write {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 2rem 1rem;
}

.guestbook-write h1 {
  margin: 0 0 0.5rem;
}

.write-desc {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1rem;
  line-height: 1.6;
}

.write-tips {
  margin: 0 0 1.5rem;
  padding: 0.9rem 1.1rem 0.9rem 2rem;
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.88rem;
  line-height: 1.8;
}

.write-tips code {
  font-family: monospace;
  font-size: 0.85em;
  background: var(--color-bg-soft);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}
</style>
