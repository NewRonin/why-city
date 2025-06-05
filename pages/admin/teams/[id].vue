<template>
  <div class="team-edit-page">
    <Button 
      icon="pi pi-arrow-left" 
      class="p-button-text back-button"
      @click="navigateToTeamsList"
    />
    
    <div class="edit-form">
      <h2 class="form-title">{{ route.params.id === 'new' ? 'Создание команды' : 'Редактирование команды' }}</h2>
      
      <div class="form-group">
        <label class="form-label">Название команды</label>
        <InputText 
          v-model="teamForm.name" 
          placeholder="Введите название"
          class="form-input"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Пароль</label>
        <Password 
          v-model="teamForm.password" 
          toggleMask
          inputClass="form-input"
          class="password-input"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Маршрут</label>
        <Dropdown 
          v-model="teamForm.routeId" 
          :options="routes" 
          optionLabel="routeNumber" 
          optionValue="id"
          placeholder="Выберите маршрут"
          class="form-dropdown"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Текущая точка</label>
        <InputNumber 
          v-model="teamForm.currentPoint" 
          :min="1" 
          inputClass="form-input"
          class="number-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Счёт команды</label>
        <InputNumber 
          v-model="teamForm.score" 
          inputClass="form-input"
          class="number-input"
        />
      </div>
      
      <div class="form-actions">
        <Button 
          label="Отмена" 
          class="p-button-text cancel-btn"
          @click="navigateToTeamsList"
        />
        <Button 
          label="Сохранить" 
          icon="pi pi-check"
          class="save-btn"
          @click="saveTeam"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const { data: routes } = useFetch('/api/routes')

const teamForm = ref({
  id: null,
  name: '',
  password: '',
  routeId: null,
  currentPoint: 1,
  score: 0,
})

onMounted(async () => {
  if (route.params.id !== 'new') {
    try {
      const data = await $fetch(`/api/teams/${route.params.id}`)
      teamForm.value = { ...data }
    } catch (error) {
      console.error('Ошибка при загрузке команды:', error)
    }
  }
})

const navigateToTeamsList = () => {
  router.push('/admin/teams')
}

const saveTeam = async () => {
  try {
    if (teamForm.value.id) {
      await $fetch(`/api/teams/${teamForm.value.id}`, {
        method: 'PUT',
        body: teamForm.value
      })
    } else {
      await $fetch('/api/teams', {
        method: 'POST',
        body: teamForm.value
      })
    }
    navigateToTeamsList()
  } catch (error) {
    console.error('Ошибка при сохранении команды:', error)
  }
}
</script>

<style scoped lang="scss">
.team-edit-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.back-button {
  margin-bottom: 20px;
  padding: 8px 12px;
  font-size: 14px;
}

.edit-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #4a5568;
}

.password-input,
.number-input {
  width: 100%;
}

.form-dropdown {
  width: 100%;
}

/* Специальные настройки для Password */
:deep(.p-password) {
    display: flex;
    width: 100%;
    
    .p-inputtext {
      flex-grow: 1;
    }
  }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #edf2f7;
}

.cancel-btn {
  padding: 10px 20px;
  color: #718096;
  font-weight: 500;
  
  &:hover {
    background-color: #f7fafc;
  }
}

.save-btn {
  padding: 10px 20px;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .edit-form {
    padding: 20px;
  }
  
  .form-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>