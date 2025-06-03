<template>
  <div class="admins-page">
    <div class="header">
      <h2>Администраторы</h2>
      <Button 
        label="Добавить администратора" 
        icon="pi pi-plus" 
        @click="navigateToNewAdmin"
        class="create-button"
      />
    </div>
    
    <DataTable :value="admins" class="admins-table" stripedRows>
      <Column field="username" header="Логин"></Column>
      <Column header="Действия" style="width: 120px">
        <template #body="{ data }">
          <div class="actions">
            <Button 
              icon="pi pi-pencil" 
              class="p-button-rounded p-button-text edit-btn"
              @click="navigateToEditAdmin(data.id)"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-text p-button-danger delete-btn"
              @click="() => deleteAdmin(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
const { data: admins, refresh } = useFetch('/api/admins')

const navigateToNewAdmin = () => {
  navigateTo('/admin/access/new')
}

const navigateToEditAdmin = (id) => {
  navigateTo(`/admin/access/${id}`)
}

const deleteAdmin = async (id) => {
  if (confirm('Вы уверены, что хотите удалить этого администратора?')) {
    try {
      const { success } = await $fetch(`/api/admins?id=${id}`, { 
        method: 'DELETE' 
      })
      
      if (success) {
        await refresh()
        // Можно добавить Toast уведомление об успехе
      }
    } catch (error) {
      console.error('Ошибка при удалении администратора:', error)
      // Показать ошибку пользователю
    }
  }
}
</script>

<style scoped lang="scss">
.admins-page {
  max-width: 900px;
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
}

.admins-table {
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