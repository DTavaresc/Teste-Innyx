<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App principal - apenas container para as rotas
</script>

<style>
#app {
  min-height: 100vh;
}

.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content-wrapper {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.card-shadow:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>