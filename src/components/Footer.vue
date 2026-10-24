<template>
  <footer>
    <div class="footer-content">
      <p>© {{ year }} 平南县中学 | 地址：广西贵港市平南县平南镇城东路136号 | 电话：0775-7822153 | 邮箱：lyxyz5223@qq.com</p>
      <p class="build-version" title="构建版本，用于核对线上部署">v{{ version }}</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
// 构建时由 Vite define 注入（git 短 hash），便于线上核对版本
const version = __APP_VERSION__
</script>

<style scoped>
footer { background: #222; color: #fff; text-align: center; padding: 1em 0; }
.footer-content { font-size: 0.95em; }
.build-version {
  margin-top: 0.25em;
  font-size: 0.72em;
  color: rgba(255, 255, 255, 0.45);
}
</style>
