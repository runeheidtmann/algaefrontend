<template>
  <v-main class="main-content">
    <router-view />
  </v-main>
</template>

<script setup>
  //
</script>

<style scoped>
.main-content {
  background-color: #f8f9fa;
}

.main-content :deep(.v-main__wrap) {
  display: flex;
  flex-direction: column;
}
</style>
