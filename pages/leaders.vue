<template>
  <div>
    <Leaderboard :teams="teams" />
  </div>
</template>

<script setup>
const { data, error } = await useFetch('/api/leaderboard')

if (error.value) {
  console.error('Failed to fetch leaderboard:', error.value)
}

const teams = data.value?.data || []
</script>
