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
      留言保存在项目的 GitHub Discussions 中。发布需要登录 GitHub 账号。
    </p>

    <ul class="write-tips">
      <li>支持 Markdown：<strong>加粗</strong>、列表、链接等。</li>
      <li>
        插入图片：在评论框粘贴 Markdown 图片链接
        <code>![](https://example.com/photo.jpg)</code>，可使用任意外链图床。
      </li>
      <li>
        giscus 评论框不支持直接上传图片。若想用 GitHub 托管图片，请
        <a class="github-link" :href="discussionUrl" target="_blank" rel="noopener noreferrer">
          在 GitHub 讨论页直接留言
          <svg class="icon" viewBox="0 0 24 24" width="0.9em" height="0.9em" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
        ，留言会同步显示在留言板。
      </li>
    </ul>

    <GiscusComment mapping="number" :term="GUESTBOOK_DISCUSSION_NUMBER" />
  </article>
</template>

<script setup>
import GiscusComment from '@/components/GiscusComment.vue'
import {
  GUESTBOOK_DISCUSSION_NUMBER,
  GUESTBOOK_DISCUSSION_URL,
  GUESTBOOK_TITLE
} from '@/config/guestbook.js'
import { applyPageMeta } from '@/utils/meta.js'

const discussionUrl = GUESTBOOK_DISCUSSION_URL

// giscus 使用 number 映射绑定固定讨论 #17，与页面标题无关
applyPageMeta({
  title: GUESTBOOK_TITLE,
  description: '平南县中学留言板：留下你的想法与建议。',
  path: '/guestbook/write'
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

.github-link {
  color: var(--color-accent);
  text-decoration: none;
}

.github-link:hover {
  text-decoration: underline;
}

.write-tips code {
  font-family: monospace;
  font-size: 0.85em;
  background: var(--color-bg-soft);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}
</style>
