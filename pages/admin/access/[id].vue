<template>
  <div class="admin-edit-page">
    <Button 
      icon="pi pi-arrow-left" 
      class="p-button-text back-button"
      @click="navigateToAdminsList"
    />
    
    <div class="edit-form">
      <div class="form-group">
        <label>Логин</label>
        <InputText v-model="adminForm.username" placeholder="Введите логин" />
      </div>
      
      <div class="form-group">
        <label>Пароль</label>
        <Password v-model="adminForm.password" toggleMask />
      </div>
      
      <div class="form-actions">
        <Button 
          label="Отмена" 
          class="p-button-text cancel-btn"
          @click="navigateToAdminsList"
        />
        <Button 
          label="Сохранить" 
          icon="pi pi-check"
          class="save-btn"
          @click="saveAdmin"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const adminForm = ref({
  id: null,
  username: '',
  password: ''
})

onMounted(async () => {
  if (route.params.id !== 'new') {
    try {
      const data = await $fetch(`/api/admins?id=${route.params.id}`)
      adminForm.value = { 
        id: data.id,
        username: data.username,
        password: '' // Пароль не получаем из API
      }
    } catch (error) {
      console.error('Ошибка при загрузке администратора:', error)
    }
  }
})

const navigateToAdminsList = () => {
  router.push('/admin/access')
}

const saveAdmin = async () => {
  try {
    const payload = {
      username: adminForm.value.username
    }
    
    if (adminForm.value.password) {
      payload.password = adminForm.value.password
    }

    if (adminForm.value.id) {
      await $fetch(`/api/admins?id=${adminForm.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      if (!adminForm.value.password) {
        throw new Error('Пароль обязателен при создании')
      }
      await $fetch('/api/admins', {
        method: 'POST',
        body: payload
      })
    }
    
    navigateToAdminsList()
  } catch (error) {
    console.error('Ошибка при сохранении администратора:', error)
  }
}
</script>

<style scoped lang="scss">
.admin-edit-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 20px;
}

.edit-form {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 25px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.back-button {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .edit-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
}
</style>