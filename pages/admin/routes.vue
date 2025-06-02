
<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Маршруты</h1>

    <Button label="Добавить маршрут" icon="pi pi-plus" @click="openCreateDialog" class="mb-4" />

    <DataTable :value="routes" dataKey="id" :loading="loading">
      <Column field="id" header="ID" />
      <Column field="routeNumber" header="Номер маршрута" />
      <Column header="Точки">
        <template #body="{ data }">
          {{ data.points?.length || 0 }} точек
        </template>
      </Column>
      <Column header="Действия">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text @click="editRoute(data)" />
          <Button icon="pi pi-trash" text severity="danger" @click="deleteRoute(data.id)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialogVisible" header="Маршрут" :modal="true" :closable="false">
      <div class="p-fluid space-y-4">
        <InputText v-model="editedRoute.routeNumber" placeholder="Номер маршрута" />
      </div>

      <template #footer>
        <Button label="Отмена" text @click="dialogVisible = false" />
        <Button label="Сохранить" @click="saveRoute" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFetch } from '#app'

const routes = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const editedRoute = ref<any>({ id: null, routeNumber: '' })

const fetchRoutes = async () => {
  loading.value = true
  const { data } = await useFetch('/api/routes')
  routes.value = data.value || []
  loading.value = false
}

const openCreateDialog = () => {
  editedRoute.value = { id: null, routeNumber: '' }
  dialogVisible.value = true
}

const editRoute = (route: any) => {
  editedRoute.value = { ...route }
  dialogVisible.value = true
}

const saveRoute = async () => {
  if (!editedRoute.value.routeNumber) return

  if (editedRoute.value.id) {
    await $fetch('/api/routes', {
      method: 'PUT',
      body: editedRoute.value,
    })
  } else {
    await $fetch('/api/routes', {
      method: 'POST',
      body: editedRoute.value,
    })
  }

  dialogVisible.value = false
  fetchRoutes()
}

const deleteRoute = async (id: number) => {
  if (confirm('Удалить маршрут?')) {
    await $fetch(`/api/routes?id=${id}`, {
      method: 'DELETE',
    })
    fetchRoutes()
  }
}

onMounted(fetchRoutes)
</script>

<style scoped>
.p-fluid > * {
  width: 100%;
}
</style>