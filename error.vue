<template>
  <div class="error-page">
    <h1>ПОТРАЧЕНО</h1>
    <div class="error-container">
      <div class="error-code">{{ error.statusCode }}</div>
      <div class="error-message">
        {{ getErrorMessage }}
      </div>
      <NuxtLink to="/" class="home-button">
        <i class="pi pi-home"></i>
        Вернуться на главную
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const getErrorMessage = computed(() => {
  if (props.error.statusCode === 404) {
    return 'Страница не найдена'
  } else if (props.error.statusCode === 403) {
    return 'Доступ запрещён'
  } else if (props.error.statusCode === 500) {
    return 'Ошибка сервера'
  }
  return props.error.message || 'Что-то пошло не так'
})
</script>

<style scoped lang="scss">
.error-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  background-color: #232323;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 1000;

  h1 {
    font-size: clamp(2rem, 30dvw, 8rem);
    font-family: GTA;
    color: var(--hostel-500);
    font-weight: 400;
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
  padding: 3rem;
  border-radius: 1.6rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: #ff4757;
  margin-bottom: 1rem;
  line-height: 1;
}

.error-message {
  font-size: 2rem;
  color: #f5f5f5;
  margin-bottom: 3rem;
  max-width: 80%;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.5rem 3rem;
  background-color: #ff4757;
  color: white;
  border-radius: 1rem;
  text-decoration: none;
  font-size: 1.6rem;
  transition: all 0.3s ease;
  
  i {
    font-size: 1.4rem;
  }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-message {
    font-size: 1.6rem;
  }
  
  .home-button {
    font-size: 1.4rem;
    padding: 1.5rem 3rem;
  }
}
</style>