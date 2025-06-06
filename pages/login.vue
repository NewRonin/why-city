<template>
  <div class="login-page">
    <div v-if="!loginType" class="choose-type">
      <NuxtImg
        class="main-logo"
        src="/questLogo.png">
      </NuxtImg>
      <div class="button-wrapper">
        <Button label="Я участник" severity="primary" @click="enterPlayer" />
        <Button label="Я организатор" severity="secondary" outlined @click="enterAdmin" />
      </div>
    </div>

    <!-- Форма для участника -->
    <div v-else-if="loginType === 'user'">
      <div class="login-container">
        <h1 class="title">Вход для команды</h1>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <Password 
            v-model="password"
            placeholder="Введите пароль"
            :feedback="false"
            toggleMask
            inputClass="w-full"
            :inputStyle="{ 'font-size': '1.6rem', padding: '1.5rem' }"
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

    <!-- Форма для организатора -->
    <div v-else-if="loginType === 'admin'">
      <div class="login-container">
        <h1 class="title">Вход для организатора</h1>
        
        <form @submit.prevent="handleAdminLogin" class="login-form">
          <InputText
            v-model="adminUsername"
            placeholder="Введите логин"
            class="w-full mb-3"
            :inputStyle="{ 'font-size': '1.6rem', padding: '1.5rem' }"
            required
          />
          
          <Password 
            v-model="adminPassword"
            placeholder="Введите пароль организатора"
            :feedback="false"
            toggleMask
            inputClass="w-full"
            :inputStyle="{ 'font-size': '1.6rem', padding: '1.5rem' }"
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

const loginType = ref<'user' | 'admin'>()
const password = ref('')
const adminUsername = ref('')
const adminPassword = ref('')
const teamName = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

function enterPlayer() {
  loginType.value = 'user'
  errorMessage.value = ''
}

function enterAdmin() {
  loginType.value = 'admin'
  errorMessage.value = ''
}

const handleLogin = async () => {
  if (!password.value) {
    errorMessage.value = 'Пожалуйста, введите пароль'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/auth/team', {
      method: 'POST',
      body: { password: password.value }
    })
    
    teamName.value = response.name
    store.setUser(teamName.value)
    store.setPassword(password.value)
    store.setIsAdmin(false) // Устанавливаем флаг, что это не админ
    navigateTo('/')
  } catch (error) {
    errorMessage.value = 'Неверный пароль'
  } finally {
    isLoading.value = false
  }
}

const handleAdminLogin = async () => {
  if (!adminUsername.value || !adminPassword.value) {
    errorMessage.value = 'Пожалуйста, введите логин и пароль'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/auth/admin', {
      method: 'POST',
      body: { 
        username: adminUsername.value,
        password: adminPassword.value 
      }
    })
    
    store.setAdminPassword(adminUsername.value, adminPassword.value)
    store.setIsAdmin(true)
    navigateTo('/admin')
  } catch (error) {
    errorMessage.value = 'Неверные учетные данные'
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
    gap: 3rem;

    h1 {
      font-family: AKONY;
      font-size: 2rem; 
      text-align: center;
      margin-bottom: 5rem;
      font-weight: 700;
    }

    .main-logo{
      height: auto;
      width: 100%;
      object-fit: contain;
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
}

.p-inputtext {
  width: 100%;
  font-size: 1.6rem;
  padding: 1.5rem;
}

// Стили для компонента Password
:deep(.p-password) {
  width: 100%;
  
  .p-password-input {
    width: 100%;
    font-size: 1.6rem;
    padding: 1.5rem;
  }
}
</style>