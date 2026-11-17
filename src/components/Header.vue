<template>
  <header class="header">
    <div class="header-logo">
      <img src="@/assets/img/logo.webp" alt="平南县中学LOGO" class="logo" />
      <span class="school-name">平南县中学</span>
    </div>
    <nav :class="{ open: menuOpen }">
      <ul>
        <li><router-link to="/" @click="menuOpen = false">首页</router-link></li>
        <li><router-link to="/about" @click="menuOpen = false">学校简介</router-link></li>
        <li><router-link to="/news" @click="menuOpen = false">新闻动态</router-link></li>
        <li><router-link to="/guestbook" @click="menuOpen = false">留言板</router-link></li>
        <li><router-link to="/contact" @click="menuOpen = false">联系我们</router-link></li>
      </ul>
    </nav>
    <button
      class="menu-toggle"
      :aria-expanded="menuOpen"
      aria-label="切换导航菜单"
      @click="menuOpen = !menuOpen"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path v-if="!menuOpen" d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path v-else d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 90;
  min-height: var(--header-height);
  box-sizing: border-box;
  background: rgba(0, 91, 172, 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 40, 80, 0.18);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2em;
  flex-wrap: wrap;
}
.header-logo {
  display: flex;
  align-items: center;
}
.logo {
  height: 48px;
  margin-right: 1em;
}
.school-name {
  font-size: 1.5em;
  font-weight: bold;
}
nav ul {
  display: flex;
  gap: 2em;
  list-style: none;
  margin: 0;
  padding: 0;
}
nav a {
  color: #fff;
  text-decoration: none;
}
nav a.router-link-active {
  font-weight: bold;
  border-bottom: 2px solid #fff;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0.25em;
}

@media (max-width: 768px) {
  .header {
    padding: 0 1em;
  }
  .logo {
    height: 36px;
  }
  .school-name {
    font-size: 1.2em;
  }
  .menu-toggle {
    display: block;
  }
  nav {
    flex-basis: 100%;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition:
      max-height 0.25s ease,
      opacity 0.2s ease;
  }
  nav.open {
    max-height: 320px;
    opacity: 1;
  }
  nav ul {
    flex-direction: column;
    gap: 0;
    padding: 0.5em 0 0;
  }
  nav li {
    padding: 0.6em 0;
  }
  nav a {
    display: block;
  }
}
</style>