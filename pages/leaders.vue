<template>
  <div class="page-leaders">
    <Leaderboard :teams="teams" />
    <Button 
      class="login-button"
      label="Назад" 
      severity="secondary" 
      outlined 
      @click="goBack"
    />
  </div>
</template>

<script setup>
const { data, error } = await useFetch('/api/leaderboard')

if (error.value) {
  console.error('Failed to fetch leaderboard:', error.value)
}

function goBack() {
  navigateTo('/')
}

const teams = data.value?.data || []
</script>

<style scoped>
.page-leaders {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.login-button {
  width: 100%;
  padding: 1.5rem 3rem;
  font-size: 1.6rem;
}
</style>
