<template>
  <div>
    <header class="quiz-header">
      <span class="score">{{ store.score }}$</span>
      <button v-if="store.password" class="logout-btn" @click="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </header>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main'
const store = useMainStore()

const handleLogout = () => {
  store.clearPassword()
  navigateTo('/login')
}
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
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .score {
    font-weight: bold;
    color: #4a6cf7;
  }
  
  .logout-btn {
    background: transparent;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    &:hover {
      background: #f3f4f6;
      color: #4a6cf7;
    }
    
    svg {
      display: block;
    }
  }
}
</style>