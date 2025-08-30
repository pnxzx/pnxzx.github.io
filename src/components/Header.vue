<template>
  <header class="header">
    <div class="header-logo">
      <img src="@/assets/img/logo.png" alt="平南县中学LOGO" class="logo" />
      <span class="school-name">平南县中学</span>
    </div>
    <nav>
      <ul>
        <li><router-link to="/">首页</router-link></li>
        <li><router-link to="/about">学校简介</router-link></li>
        <li><router-link to="/news">新闻动态</router-link></li>
        <li><router-link to="/contact">联系我们</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
// 可添加导航逻辑
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
</style>