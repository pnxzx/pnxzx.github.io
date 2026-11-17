<template>
  <section class="contact-page">
    <header class="contact-header">
      <h2 class="section-title">联系我们</h2>
      <p class="contact-desc">欢迎垂询学校信息，或到留言板留下你的想法与建议。</p>
    </header>

    <ul class="contact-grid">
      <li class="contact-card">
        <span class="contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em">
            <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <circle cx="12" cy="11" r="1.6" fill="currentColor" />
          </svg>
        </span>
        <h3>学校地址</h3>
        <p>广西贵港市平南县平南镇城东路136号</p>
        <span class="contact-extra">邮编 537300</span>
      </li>

      <li class="contact-card">
        <span class="contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em">
            <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
        </span>
        <h3>联系电话</h3>
        <p><a href="tel:+867757822153">0775-7822153</a></p>
        <span class="contact-extra">学校办公室</span>
      </li>

      <li class="contact-card">
        <span class="contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em">
            <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
        </span>
        <h3>电子邮箱</h3>
        <p><a href="mailto:lyxyz5223@qq.com">lyxyz5223@qq.com</a></p>
        <span class="contact-extra">建议与反馈</span>
      </li>

      <li class="contact-card">
        <span class="contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1.3em" height="1.3em">
            <path d="M9 19c-4 .9-4-2-5-2.5M15 21v-3.4a3 3 0 0 0-.8-2.3c2.6-.3 5.3-1.3 5.3-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.3S17 2.3 15 4a11.5 11.5 0 0 0-6 0C7 2.3 6 2.8 6 2.8a4.3 4.3 0 0 0-.1 3.3A4.7 4.7 0 0 0 4.5 9.3c0 4.7 2.7 5.7 5.3 6a3 3 0 0 0-.8 2.3V21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        </span>
        <h3>开源仓库</h3>
        <p>
          <a :href="repoUrl" target="_blank" rel="noopener noreferrer">pnxzx.github.io</a>
        </p>
        <span class="contact-extra">欢迎提交 Issue</span>
      </li>
    </ul>

    <div class="contact-cta">
      <div>
        <h3>想说的不止这些？</h3>
        <p>留言板支持 Markdown 与外链图片，登录 GitHub 即可发布。</p>
      </div>
      <router-link class="cta-link" to="/guestbook">
        去留言板
        <svg class="icon" viewBox="0 0 24 24" width="0.9em" height="0.9em" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </router-link>
    </div>

    <details class="disclaimer-box">
      <summary>免责声明</summary>
      <Disclaimer />
    </details>
  </section>
</template>

<script setup>
import Disclaimer from './Disclaimer.vue'
import { GITHUB_REPO } from '@/config/site.js'

const repoUrl = GITHUB_REPO
</script>

<style scoped>
.contact-page {
  max-width: var(--container-width-wide);
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.contact-header {
  margin-bottom: 1.5rem;
}

.contact-header h2 {
  margin: 0 0 0.5rem;
}

.contact-desc {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
}

.contact-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  transition: border-color 0.2s ease;
}

.contact-card:hover {
  border-color: var(--color-primary-border);
}

.contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-accent);
  margin-bottom: 0.6rem;
}

.contact-card h3 {
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  color: var(--color-text-strong);
}

.contact-card p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.92rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.contact-card a {
  color: var(--color-accent);
  text-decoration: none;
}

.contact-card a:hover {
  text-decoration: underline;
}

.contact-extra {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: var(--color-text-faint);
}

.contact-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
}

.contact-cta h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: var(--color-text-strong);
}

.contact-cta p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.5rem 1.1rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
}

.cta-link:hover {
  background: var(--color-primary-dark);
}

.disclaimer-box {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.disclaimer-box summary {
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.88rem;
  list-style: none;
}

.disclaimer-box summary::-webkit-details-marker {
  display: none;
}

.disclaimer-box summary::before {
  content: '▸';
  display: inline-block;
  margin-right: 0.4em;
  transition: transform 0.2s ease;
}

.disclaimer-box[open] summary::before {
  transform: rotate(90deg);
}

.disclaimer-box :deep(.disclaimer) {
  margin-top: 1rem;
  background: transparent;
  padding: 0;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .contact-cta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
