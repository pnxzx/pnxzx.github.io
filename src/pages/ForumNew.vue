<template>
  <article class="forum-new">
    <button class="back-button" @click="goBack">
      <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M16 4 8 12l8 8z" fill="currentColor" />
      </svg>
      返回话题列表
    </button>

    <template v-if="!published">
      <header class="new-header">
        <h1>发起新话题</h1>
        <p class="new-desc">
          填写标题后，在下方评论区输入正文并发布——评论提交后系统会自动创建话题。
          发布需要登录 GitHub 账号（首次会弹出授权窗口）。
        </p>
      </header>

      <form class="new-form" @submit.prevent>
        <label class="field">
          <span class="field-label">话题标题</span>
          <input
            v-model.trim="title"
            type="text"
            class="field-input"
            placeholder="例如：今年校运会有什么看点？"
            maxlength="80"
            required
          />
        </label>
        <p v-if="title" class="title-preview">
          正文请直接在下方评论区输入，标题将以「{{ title }}」创建。
        </p>
      </form>

      <div v-if="title" class="giscus-compose">
        <div class="compose-hint">
          <svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path d="M12 8v5m0 3v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" />
          </svg>
          在下方评论区输入正文并发布（发布后本页会自动检测并跳转到新话题）
        </div>
        <GiscusComment :key="title" />
      </div>

      <div v-if="waiting" class="waiting">
        <span class="spinner"></span>
        正在检测新话题...
        <button class="link-button" @click="stopWaiting">取消</button>
      </div>

      <div v-if="failed" class="failed">
        未能自动检测到新话题。
        <a :href="manualCheckUrl" target="_blank" rel="noopener noreferrer">手动到 GitHub 查看</a>
        或
        <button class="link-button" @click="startWaiting">重试检测</button>
      </div>
    </template>
  </article>
</template>

<script setup>
// 站内发帖：利用 giscus mapping=title 的按需建讨论机制——
// 标题输入后 document.title 即为话题标题，giscus 评论区发出的
// 第一条评论会自动创建同名 Discussion；随后轮询 REST API 按标题
// 找到新讨论编号并跳转 /forum/:number。
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GiscusComment from '@/components/GiscusComment.vue'

const REPO_OWNER = 'pnxzx'
const REPO_NAME = 'pnxzx.github.io'
const PREV_TITLE = '交流论坛 - 平南县中学'

const router = useRouter()
const title = ref('')
const waiting = ref(false)
const failed = ref(false)
let pollTimer = null
let tries = 0
const MAX_TRIES = 30 // 30 * 2s = 60s

const manualCheckUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/discussions?discussions_q=`

// 标题变化 → document.title 跟随 → giscus 绑定到目标讨论；
// 标题非空时开始轮询检测（评论发布 → giscus 自动建讨论 → 跳转）
watch(title, (t) => {
  document.title = t || PREV_TITLE
  if (t) startWaiting()
  else stopWaiting()
})

function normalize(s) {
  return s.replace(/\s+/g, '').toLowerCase()
}

const published = ref(false)

async function poll() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/discussions?per_page=50`, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) return
    const items = await res.json()
    const found = items.find(d => normalize(d.title) === normalize(title.value))
    if (found) {
      stopWaiting()
      published.value = true
      router.replace(`/forum/${found.number}`)
    }
  } catch { /* 网络抖动忽略，下一轮重试 */ }
}

function startWaiting() {
  if (!title.value || waiting.value) return
  failed.value = false
  waiting.value = true
  tries = 0
  poll()
  pollTimer = setInterval(() => {
    tries += 1
    if (tries > MAX_TRIES) {
      stopWaiting()
      failed.value = true
      return
    }
    poll()
  }, 2000)
}

function stopWaiting() {
  waiting.value = false
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

onUnmounted(() => {
  stopWaiting()
  if (!published.value) document.title = PREV_TITLE
})

const goBack = () => {
  if (window.history.length > 1 && window.history.state?.back) router.back()
  else router.replace('/forum')
}
</script>

<style scoped>
.forum-new {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: #eee;
}

.new-header h1 {
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  color: #333;
  margin: 0 0 0.5rem;
}

.new-desc {
  color: #888;
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.new-form {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.4rem;
}

.field-input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.field-input:focus {
  outline: none;
  border-color: #005bac;
}

.title-preview {
  color: #005bac;
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
}

.giscus-compose {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
}

.compose-hint {
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.waiting {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
  color: #555;
  font-size: 0.9rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top-color: #005bac;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.failed {
  margin-top: 1.5rem;
  color: #b06000;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: #005bac;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.link-button:hover {
  text-decoration: underline;
}
</style>
