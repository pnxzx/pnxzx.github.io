<template>
  <Header />
  <main class="router-view">
    <router-view />
  </main>
  <Footer />
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<style>
/* main 撑满剩余高度；页脚贴底 */
#app > .router-view {
  flex: 1;
}

main.router-view {
  display: block;
}
</style>
