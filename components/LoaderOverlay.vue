<template>
  <div class="loader-overlay" style="z-index: 50;">
    <div class="loader-container">
      <BeatLoader color="#ffffff" size="10px" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
