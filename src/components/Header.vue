<template>
  <header class="header">
    <div class="header-logo">
      <img src="@/assets/img/logo.png" alt="平南县中学LOGO" class="logo" />
      <span class="school-name">平南县中学</span>
    </div>
    <nav :class="{ open: menuOpen }">
      <ul>
        <li><router-link to="/" @click="menuOpen = false">首页</router-link></li>
        <li><router-link to="/about" @click="menuOpen = false">学校简介</router-link></li>
        <li><router-link to="/news" @click="menuOpen = false">新闻动态</router-link></li>
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
  background: #005bac;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em 2em;
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
    flex-wrap: wrap;
    padding: 0.75em 1em;
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
    display: none;
    flex-basis: 100%;
  }
  nav.open {
    display: block;
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