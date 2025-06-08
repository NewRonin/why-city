<template>
  <div class="page-leaders">
    <div v-if="pageEnabled">
      <Leaderboard :teams="teams" />
    </div>
    <div v-else class="disabled-message">
      <h3>Результаты станут доступны через:</h3>
      <div class="timer">
        <div class="timer-block">
          <span class="timer-value">{{ hours }}</span>
          <span class="timer-label">часов</span>
        </div>
        <div class="timer-block">
          <span class="timer-value">{{ minutes }}</span>
          <span class="timer-label">минут</span>
        </div>
        <div class="timer-block">
          <span class="timer-value">{{ seconds }}</span>
          <span class="timer-label">секунд</span>
        </div>
      </div>
    </div>
    <Button 
        class="login-button"
        label="Назад" 
        severity="secondary" 
        outlined 
        @click="goBack"
      />

    <div class="container-logo">

      <NuxtImg class="img-logo" src="/logo-white-collab.svg" />
      <NuxtImg class="img-logo" src="/logo-white-hostel.svg" />

    </div>
  </div>
</template>

<script setup>
const pageEnabled = ref(false)
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const teams = ref([])

// Устанавливаем целевую дату
const targetDate = new Date('2025-06-08T22:00:00+03:00')

// Проверяем статус страницы
const { data: pageStatus } = await useFetch('/api/showModules', {
  query: { pageName: 'leaders' }
})

// Устанавливаем начальное состояние
pageEnabled.value = pageStatus.value?.isEnabled ?? false


// Загружаем данные в любом случае (но не будем их использовать если страница отключена)
const { data } = await useFetch('/api/leaderboard')
teams.value = data.value?.data || []

// Таймер
onMounted(() => {
  if (!pageEnabled.value) {
    const updateTimer = () => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
      const diff = targetDate - now

      console.log('МСК сейчас:', now.toString(), 'Цель:', targetDate.toString())

      if (diff <= 0) {
        pageEnabled.value = true
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      hours.value = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
      minutes.value = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
      seconds.value = (totalSeconds % 60).toString().padStart(2, '0')
    }

    updateTimer() // Первое обновление сразу
    const timerInterval = setInterval(updateTimer, 1000)
    
    onBeforeUnmount(() => clearInterval(timerInterval))
  }
})

const goBack = () => navigateTo('/')
</script>

<style scoped>
/* Стили остаются без изменений */
.page-leaders {
  width: 100%;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 190px;
}

.login-button {
  width: 100%;
  padding: 1.5rem 3rem;
  font-size: 1.6rem;
  margin-top: 4rem;
}

.disabled-message {
  text-align: center;
  padding: 2rem;
  background: #fff3f3;
  border-radius: 8px;
  margin-top: 2rem;
}

.disabled-message h3 {
  font-size: 2rem;
  color: #ff4d4f;
  margin-bottom: 1.5rem;
}

.timer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.timer-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-value {
  font-size: 6rem;
  font-family: GTA;
  color: #ff4d4f;
}

.timer-label {
  font-size: 1rem;
  color: #666;
}

@media (max-width: 480px) {
  .timer {
    gap: 10px;
  }
  
  .timer-value {
    font-size: 6rem;
  }
  
  .timer-label {
    font-size: 1.6rem;
  }
}

.container-logo{
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  gap: 4rem;

  .img-logo{
    width: 30%;
    max-width: 90px;
    height: auto;
    max-height: 9rem;
    object-fit: contain;
    user-select: none;
    pointer-events: none;
  }
}
</style>