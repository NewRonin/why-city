<template>
  <div class="layout">
    <header class="quiz-header">
      <ClientOnly><span class="score">{{ animatedScore }}$</span></ClientOnly>
      <button v-if="store.password" class="logout-btn" @click="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </header>

    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main'

useHead({
  htmlAttrs: {
    class: 'darkmode'
  }
})

const store = useMainStore()
const animatedScore = ref(0)
let animationFrame: number | null = null

// SSR-safe animation
const animateScore = (newScore: number) => {
  if (typeof window === 'undefined') return
  
  const duration = 1000 // 1 second
  const startTime = performance.now()
  const startValue = animatedScore.value
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    animatedScore.value = Math.floor(startValue + (newScore - startValue) * progress)
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate)
    }
  }
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  
  animationFrame = requestAnimationFrame(animate)
}

// Initialize and watch for score changes
onMounted(() => {
  animatedScore.value = store.score
})

watch(
  () => store.score,
  (newScore) => {
    if (process.client) {
      animateScore(newScore)
    } else {
      animatedScore.value = newScore
    }
  },
  { immediate: true }
)

const handleLogout = () => {
  store.clearPassword()
  navigateTo('/login')
}

// Clean up animation frame
onBeforeUnmount(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped lang="scss">
/* Your existing styles remain unchanged */
.layout {
    display: flex;
    flex-flow: column wrap;
    justify-content: flex-start;
    width: 100dvw;
    min-height: 100dvh;
    overflow: hidden;
  }

.quiz-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 7rem;
  padding: 1.2rem 1.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--base-black);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .score {
    font-size: 4rem;
    font-family: GTA;
    font-weight: 100;
    color: var(--accent-hostel);
    transition: transform 0.3s ease;
    
    &.animating {
      transform: scale(1.1);
    }
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
    
    svg {
      display: block;
    }
  }
}

.page-content{
    padding-top: 7rem;
    height: 100%;
  }
</style>

<style lang="scss">
.p-button {
    color: white;
}
</style>