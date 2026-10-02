<template>
  <section class="contact">
    <Disclaimer />
  </section>
</template>

<script setup>
import Disclaimer from '../components/Disclaimer.vue'
</script>

<style scoped>
.contact { background: var(--color-bg-page); padding: 2em; border-radius: var(--radius-md); }
.contact h2 { color: var(--color-primary); }
</style>
