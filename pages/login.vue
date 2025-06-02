<template>
  <div class="login-page">
    <div v-if="!loginType" class="choose-type">
      <h1>НАЧАТЬ ИГРУ</h1>
      <div class="button-wrapper">
        <Button label="Я участник" severity="primary" @click="enterPlayer" />
        <Button label="Я организатор" severity="secondary" outlined />
      </div>
    </div>
    <div v-else-if="loginType === 'user'">
      <div class="login-container">
      <h1 class="title">Вход для команды</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <InputMain
          v-model="password"
          label="Пароль команды"
          type="password"
          placeholder="Введите ваш пароль"
          required
        />
        
        <Button type="submit" class="login-button" severity="primary" :disabled="isLoading">
          {{ isLoading ? 'Загрузка...' : 'Войти' }}
        </Button>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main'
const store = useMainStore()
const loginType = ref()
const password = ref('')
const teamName = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

function enterPlayer() {
    loginType.value = 'user'
}

const handleLogin = async () => {
  if (!password.value) {
    errorMessage.value = 'Пожалуйста, введите пароль'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  teamName.value = ''

  try {
    const response = await $fetch('/api/auth/team', {
      method: 'POST',
      body: { password: password.value }
    })
    
    teamName.value = response.name
    store.setUser(teamName.value)
    store.setPassword(password.value)
    navigateTo('/')
  } catch (error) {
    errorMessage.value = 'Неверный пароль'
  } finally {
    isLoading.value = false
  }
}



</script>

<style scoped lang="scss">

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  .choose-type {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;

    h1 {
      font-family: AKONY;
      font-size: 2rem; 
      text-align: center;
      margin-bottom: 5rem;
      font-weight: 700;
    }

    .button-wrapper {
      width: 100%;
      max-width: 20rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .p-button {
        font-size: 1.6rem;
        padding: 1.5rem 3rem;
      }
    }
  }
}

.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.login-button {
  padding: 1.5rem 3rem;
  font-size: 1.6rem;
}

.error-message {
  color: var(--error);
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.success-message {
  font-size: 1.4rem;
  color: var(--success);
  padding: 1rem;
  border-radius: 0.6rem;
  background-color: rgba(0, 128, 0, 0.1);
}

</style>
