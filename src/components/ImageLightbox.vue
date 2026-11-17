<template>
  <Teleport to="body">
    <div
      v-if="src"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      @click.self="close"
    >
      <button class="lightbox-close" aria-label="关闭预览" @click="close">×</button>
      <img class="lightbox-image" :src="src" :alt="alt" />
      <a class="lightbox-original" :href="src" target="_blank" rel="noopener noreferrer">
        在新标签页查看原图
      </a>
    </div>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' }
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.src,
  (value) => {
    if (value) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  }
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.85);
  cursor: zoom-out;
}

.lightbox-image {
  max-width: min(92vw, 1400px);
  max-height: 82vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: #111;
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-original {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  text-decoration: none;
}

.lightbox-original:hover {
  color: #fff;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .lightbox {
    padding: 1rem;
  }
}
</style>
