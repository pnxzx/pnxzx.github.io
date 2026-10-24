<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

</script>

<template>
  <div id="main">
    <Header />
    <div class="router-view">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<style>
#main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
header, footer {
  flex-shrink: 0;
}
.router-view {
  flex: 1;
}

</style>
