<template>
  <div class="page-access-control">
    <div class="header">
      <h2>Управление доступом к страницам</h2>
      <div class="header-actions">
        <Button 
          icon="pi pi-plus" 
          label="Добавить страницу" 
          @click="showAddDialog = true"
          class="add-button"
        />
        <Button 
          icon="pi pi-refresh" 
          label="Обновить" 
          @click="loadPageStates"
          class="refresh-button"
          outlined
        />
      </div>
    </div>
    
    <DataTable 
      :value="pages" 
      :loading="loading"
      class="access-table" 
      stripedRows
    >
      <Column field="pageName" header="Страница">
        <template #body="{ data }">
          {{ data.pageName }}
        </template>
      </Column>
      <Column header="Статус" style="width: 150px">
        <template #body="{ data }">
          <InputSwitch 
            v-model="data.isEnabled" 
            @change="updatePageAccess(data)"
            :disabled="loading"
          />
        </template>
      </Column>
      <Column header="Состояние" style="width: 120px">
        <template #body="{ data }">
          <Tag 
            :value="data.isEnabled ? 'Доступна' : 'Отключена'" 
            :severity="data.isEnabled ? 'success' : 'danger'" 
          />
        </template>
      </Column>
      <Column header="Действия" style="width: 100px">
        <template #body="{ data }">
          <Button 
            icon="pi pi-trash" 
            class="p-button-rounded p-button-text p-button-danger"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    
    <Dialog 
    v-model:visible="showAddDialog" 
    header="Добавить новую страницу" 
    :modal="true"
    style="width: 500px"
    >
    <div class="p-fluid">
        <div class="p-field">
        <label for="pageName">Имя страницы (латиница)</label>
        <InputText 
            id="pageName" 
            v-model="newPageName" 
            placeholder="например: new-page"
        />
        </div>
    </div>
    <template #footer>
        <Button 
        label="Отмена" 
        icon="pi pi-times" 
        @click="showAddDialog = false"
        class="p-button-text"
        />
        <Button 
        label="Добавить" 
        icon="pi pi-check" 
        @click="addNewPage"
        :disabled="!newPageName"
        autofocus
        />
    </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const confirm = useConfirm()
const toast = useToast()

const pages = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const newPageName = ref('')
const newDisplayName = ref('')

// Load pages from API
const loadPageStates = async () => {
  try {
    loading.value = true
    const { data } = await useFetch('/api/showModules', {
      method: 'GET',
      server: false
    })
    
    if (data.value) {
      pages.value = data.value.map(page => ({
        ...page,
        isEnabled: !!page.isEnabled
      }))
    }
  } catch (error) {
    console.error('Ошибка загрузки состояний страниц:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить данные',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Update page access
const updatePageAccess = async (page) => {
  try {
    loading.value = true
    await $fetch('/api/showModules', {
      method: 'POST',
      body: {
        pageName: page.pageName,
        isEnabled: page.isEnabled
      }
    })
    
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: `Страница "${page.pageName}" ${page.isEnabled ? 'включена' : 'отключена'}`,
      life: 3000
    })
  } catch (error) {
    console.error('Ошибка обновления состояния:', error)
    page.isEnabled = !page.isEnabled
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось обновить статус страницы',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Add new page
const addNewPage = async () => {
  try {
    if (!newPageName.value) return
    
    loading.value = true
    const pageName = newPageName.value.toLowerCase().replace(/\s+/g, '-')
    
    await $fetch('/api/showModules', {
      method: 'POST',
      body: {
        pageName,
        isEnabled: true,
      }
    })
    
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Страница успешно добавлена',
      life: 3000
    })
    
    showAddDialog.value = false
    newPageName.value = ''
    newDisplayName.value = ''
    await loadPageStates()
  } catch (error) {
    console.error('Ошибка добавления страницы:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось добавить страницу',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Delete page confirmation
const confirmDelete = (page) => {
  confirm.require({
    message: `Вы уверены, что хотите удалить страницу "${page.pageName}"?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Удалить',
    rejectLabel: 'Отмена',
    accept: () => deletePage(page)
  })
}

// Delete page
const deletePage = async (page) => {
  try {
    loading.value = true
    await $fetch(`/api/admin/pages/${page.pageName}`, {
      method: 'DELETE'
    })
    
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Страница успешно удалена',
      life: 3000
    })
    
    await loadPageStates()
  } catch (error) {
    console.error('Ошибка удаления страницы:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось удалить страницу',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadPageStates)
</script>

<style scoped lang="scss">
.page-access-control {
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

.header-actions {
  display: flex;
  gap: 15px;
}

.add-button {
  height: 3.6rem;
  font-weight: 600;
}

.refresh-button {
  height: 3.6rem;
}

.access-table {
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

:deep(.p-inputswitch) {
  .p-inputswitch-slider {
    background: #e9ecef;
    &:before {
      background: #6c757d;
    }
  }
  
  &.p-inputswitch-checked {
    .p-inputswitch-slider {
      background: var(--primary-color);
      &:before {
        background: #ffffff;
      }
    }
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .add-button,
  .refresh-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>