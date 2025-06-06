<template>
  <div class="teams-page">
    <div class="header">
      <h2>Команды</h2>
      <Button 
        label="Создать команду" 
        icon="pi pi-plus" 
        @click="navigateToNewTeam"
        class="create-button"
      />
    </div>
    
    <DataTable :value="teams" class="teams-table" stripedRows>
      <Column field="name" header="Название"></Column>
      <Column field="route.routeNumber" header="Маршрут"></Column>
      <Column field="currentPoint" header="Текущая точка"></Column>
      <Column header="Действия" style="width: 120px">
        <template #body="{ data }">
          <div class="actions">
            <Button 
              icon="pi pi-pencil" 
              class="p-button-rounded p-button-text edit-btn"
              @click="navigateToEditTeam(data.id)"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-text p-button-danger delete-btn"
              @click="() => deleteTeam(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
const { data: teams, refresh } = useFetch('/api/teams/list')

const navigateToNewTeam = () => {
  navigateTo('/admin/teams/new')
}

const navigateToEditTeam = (id) => {
  navigateTo(`/admin/teams/${id}`)
}

const deleteTeam = async (id) => {
  if (confirm('Вы уверены, что хотите удалить эту команду?')) {
    try {
      await $fetch(`/api/teams/${id}`, { method: 'DELETE' })
      await refresh()
    } catch (error) {
      console.error('Ошибка при удалении команды:', error)
    }
  }
}
</script>

<style scoped lang="scss">
.teams-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.create-button {
  height: 40px;
  font-weight: 600;
}

.teams-table {
  margin-top: 15px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .create-button {
    width: 100%;
  }
}
</style>