<template>
  <div class="route-builder">
    <div class="route-list">
      <div class="header">
        <h2>Маршруты</h2>
        <Button 
          label="Создать маршрут" 
          icon="pi pi-plus" 
          @click="createRoute"
          class="create-button"
        />
      </div>
      
      <DataTable :value="routes" class="routes-table" stripedRows>
        <Column field="routeNumber" header="Номер"></Column>
        <Column header="Точек">
          <template #body="{ data }">{{ data.points?.length || 0 }}</template>
        </Column>
        <Column header="Действия" style="width: 120px">
          <template #body="{ data }">
            <div class="actions">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text edit-btn"
                @click="editRoute(data)"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-danger delete-btn"
                @click="() => deleteRoute(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
const { data: routes, refresh } = useFetch('/api/routes')

const createRoute = () => {
  navigateTo('/admin/routes/new')
}

const editRoute = (route) => {
  navigateTo(`/admin/routes/${route.id}`)
}

const deleteRoute = async (id) => {
  try {
    if (confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      await $fetch(`/api/routes/${id}`, { method: 'DELETE' })
      await refresh()
    }
  } catch (error) {
    console.error('Ошибка при удалении маршрута:', error)
  }
}
</script>

<style scoped lang="scss">
.route-builder {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.create-button {
  height: 3.6rem;
  font-weight: 600;
}

.routes-table {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
}

.p-datatable table {
  border-collapse: separate !important;
  border-spacing: 0 10px !important;
}

.p-datatable-tbody > tr {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
  transition: background-color 0.2s;
}

.p-datatable-tbody > tr:hover {
  background-color: #f0f8ff;
}

.p-datatable-tbody > tr > td {
  padding: 12px 15px;
  vertical-align: middle;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .create-button {
    width: 100%;
    max-width: 300px;
  }
  
  .actions {
    justify-content: flex-start;
  }
}
</style>