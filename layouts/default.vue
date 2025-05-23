<template>
  <div>
    <header class="quiz-header">
      <span class="score">{{ store.score }}$</span>
    </header>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main'
const store = useMainStore()

</script>

<style scoped lang="scss">
.quiz-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.2rem 1.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
}
</style>