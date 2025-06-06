<template>
  <div class="route-builder">
    <div class="route-edit">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text back-button"
        @click="navigateToRouteList"
      />
      
      <div class="edit-form">
        <div class="form-group">
          <label>Номер маршрута</label>
          <InputText 
            v-model="routeForm.routeNumber" 
            placeholder="Введите номер маршрута"
          />
        </div>
        
        <div class="points-header">
          <h3>Точки маршрута</h3>
          <Button 
            label="Добавить точку" 
            icon="pi pi-plus" 
            @click="editPoint()"
            class="add-point-btn"
          />
        </div>
        
        <DataTable :value="routeForm.points" class="points-table" stripedRows>
          <Column field="title" header="Название"></Column>
          <Column field="address" header="Адрес" style="min-width: 200px"></Column>
          <Column header="Тип" style="width: 120px">
            <template #body="{ data }">
              {{ taskTypeLabels[data.taskType] }}
            </template>
          </Column>
          <Column header="Действия" style="width: 120px">
            <template #body="{ data }">
              <div class="actions">
                <Button 
                  icon="pi pi-pencil" 
                  class="p-button-rounded p-button-text edit-btn"
                  @click="() => editPoint(data)"
                />
                <Button 
                  icon="pi pi-trash" 
                  class="p-button-rounded p-button-text p-button-danger delete-btn"
                  @click="() => deletePoint(data.id)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
        
        <div class="form-actions">
          <Button 
            label="Отмена" 
            class="p-button-text cancel-btn"
            @click="navigateToRouteList"
          />
          <Button 
            label="Сохранить" 
            icon="pi pi-check"
            class="save-btn"
            @click="saveRoute"
          />
        </div>
      </div>

      <Dialog 
        v-model:visible="pointDialogVisible" 
        :style="{ width: '800px' }" 
        header="Редактирование точки"
        :modal="true"
      >
        <div class="point-edit-dialog">
          <div class="form-grid">
            <div class="form-section">
              <div class="form-group">
                <label>Название точки</label>
                <InputText 
                  v-model="currentPoint.title" 
                  placeholder="Введите название"
                />
              </div>
              
              <div class="form-group">
                <label>Адрес</label>
                <Textarea 
                  v-model="currentPoint.address" 
                  placeholder="Введите адрес" 
                  rows="3" 
                  autoResize
                />
              </div>
              
              <div class="form-group">
                <label>Тип задания</label>
                <Dropdown 
                  v-model="currentPoint.taskType" 
                  :options="taskTypes" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Выберите тип"
                  appendTo="self"
                  class="w-full"
                />
              </div>
            </div>
            
            <div class="form-section">
              <div class="form-group">
                <label>Широта</label>
                <InputNumber 
                  v-model="currentPoint.latitude" 
                  mode="decimal" 
                  :min="-90" 
                  :max="90" 
                  :step="0.000001"
                  :maxFractionDigits="6"
                />
              </div>
              
              <div class="form-group">
                <label>Долгота</label>
                <InputNumber 
                  v-model="currentPoint.longitude" 
                  mode="decimal" 
                  :min="-180" 
                  :max="180" 
                  :step="0.000001"
                  :maxFractionDigits="6"
                />
              </div>
            </div>
            
            <div class="form-section full-width">
              <div class="form-group" v-if="currentPoint.taskType === 'image'">
                <label>Изображение</label>
                <FileUpload 
                  mode="basic"
                  name="file"
                  auto
                  :url="uploadUrl"
                  accept="image/*"
                  :maxFileSize="10000000"
                  @upload="onFileUpload"
                  chooseLabel="Загрузить изображение"
                />
                <div v-if="currentPoint.filePath" class="preview-image">
                  <NuxtImg 
                    v-if="loadedPreview"
                    provider="static"
                    :src="currentPoint.filePath" 
                    alt="Preview" 
                    @error="loadedPreview = false"
                  />
                </div>
              </div>

              <div class="form-group" v-if="currentPoint.taskType === 'audio'">
                <label>Аудиофайл</label>
                <FileUpload 
                  mode="basic"
                  name="file"
                  auto
                  :url="uploadUrl"
                  accept="audio/*"
                  :maxFileSize="20000000"
                  @upload="onFileUpload"
                  chooseLabel="Загрузить аудио"
                />
                <div v-if="currentPoint.filePath" class="preview-audio">
                  <audio controls>
                    <source :src="currentPoint.filePath" type="audio/mpeg">
                  </audio>
                </div>
              </div>
              
              <div class="form-group">
                <label>Задание</label>
                <Textarea 
                  v-model="currentPoint.taskText" 
                  placeholder="Опишите задание" 
                  rows="3" 
                  autoResize
                />
              </div>
              
              <div class="form-group">
                <label>Правильный ответ</label>
                <InputText 
                  v-model="currentPoint.correctAnswer" 
                  placeholder="Введите правильный ответ"
                />
              </div>
              
              <!-- <div class="form-group">
                <label>Сообщение при успехе</label>
                <Textarea 
                  v-model="currentPoint.successMessage" 
                  placeholder="Введите сообщение" 
                  rows="3" 
                  autoResize
                />
              </div> -->
            </div>
          </div>
        </div>
        <template #footer>
          <Button 
            label="Отмена" 
            class="p-button-text cancel-btn"
            @click="pointDialogVisible = false"
          />
          <Button 
            label="Сохранить" 
            icon="pi pi-check"
            class="save-btn"
            @click="savePoint"
          />
        </template>
      </Dialog>
    </div>
  </div>
</template>


<script setup>
const route = useRoute()
const router = useRouter()

const taskTypes = [
  { label: 'Текст', value: 'text' },
  { label: 'Изображение', value: 'image' },
  { label: 'Аудио', value: 'audio' }
]

const taskTypeLabels = {
  text: 'Текст',
  image: 'Изображение',
  audio: 'Аудио'
}

const routeForm = ref({
  id: null,
  routeNumber: '',
  points: []
})

const currentPoint = ref(createEmptyPoint())
const pointDialogVisible = ref(false)
const loadedPreview = ref(true)

const uploadUrl = computed(() => `/api/upload?type=${currentPoint.value.taskType}`)

function createEmptyPoint() {
  return {
    id: null,
    title: '',
    address: '',
    latitude: 0,
    longitude: 0,
    taskType: 'text',
    taskText: '', 
    filePath: null, 
    uploadedFile: null,
    correctAnswer: '',
    successMessage: '',
    fileSize: null,
    mimeType: null
  }
}

onMounted(async () => {
  if (route.params.id !== 'new') {
    try {
      const data = await $fetch(`/api/routes/${route.params.id}`)
      routeForm.value = { ...data }
    } catch (error) {
      console.error('Ошибка при загрузке маршрута:', error)
    }
  }
})

const navigateToRouteList = () => {
  router.push('/admin/routes')
}

const saveRoute = async () => {
  try {
    const dataToSend = {
      ...routeForm.value,
      points: routeForm.value.points.map(point => ({
        ...point,
        id: point.id && point.id < 1000000000000 ? point.id : undefined
      }))
    }

    if (routeForm.value.id) {
      await $fetch(`/api/routes/${routeForm.value.id}`, {
        method: 'PUT',
        body: dataToSend
      })
    } else {
      await $fetch('/api/routes', {
        method: 'POST',
        body: dataToSend
      })
    }
    
    navigateToRouteList()
  } catch (error) {
    console.error('Ошибка при сохранении маршрута:', error)
  }
}

const editPoint = (point = null) => {
  if (point) {
    currentPoint.value = { 
      ...point,
      uploadedFile: null
    }
  } else {
    currentPoint.value = createEmptyPoint()
  }
  pointDialogVisible.value = true
}

const savePoint = () => {
  const savedPoint = { ...currentPoint.value }
  delete savedPoint.uploadedFile

  if (currentPoint.value.id) {
    const index = routeForm.value.points.findIndex(p => p.id === currentPoint.value.id)
    routeForm.value.points[index] = savedPoint
  } else {
    routeForm.value.points.push({
      ...savedPoint,
      id: Date.now()
    })
  }
  
  pointDialogVisible.value = false
}

const deletePoint = (id) => {
  if (confirm('Вы уверены, что хотите удалить эту точку?')) {
    routeForm.value.points = routeForm.value.points.filter(p => p.id !== id)
  }
}

const onFileUpload = (event) => {
  const file = event.files?.[0] || event.target?.files?.[0]
  if (!file) return

  try {
    const response = JSON.parse(event.xhr.response)
    if (response.filePath) {
      currentPoint.value.filePath = response.filePath
      currentPoint.value.fileSize = response.fileSize
      currentPoint.value.mimeType = response.mimeType
      
      if (event.files?.[0]?.objectURL) {
        URL.revokeObjectURL(event.files[0].objectURL)
      }
    }
  } catch (error) {
    console.error('Ошибка обработки загруженного файла:', error)
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

.edit-form {
  background: #fff;
  border-radius: 8px;
  padding: 30px 30px 40px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #444;
}

input[type="text"],
textarea,
.p-inputtext,
.p-dropdown,
:deep(.p-inputnumber>input) {
  width: 100%;
  padding: 10px 12px;
  font-size: 1rem;
  transition: border-color 0.25s;
}

input[type="text"]:focus,
textarea:focus,
.p-inputtext:focus,
.p-dropdown:focus,
:deep(.p-inputnumber>input:focus) {
  outline: none;
  box-shadow: 0 0 5px rgba(63, 81, 181, 0.3);
}

.p-inputnumber {
  width: 100%;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px;
}

.add-point-btn {
  height: 3.6rem;
  font-weight: 600;
}

.points-table {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.back-button {
  margin-bottom: 25px;
  font-weight: 500;
  font-size: 1.1rem;
}

.cancel-btn {
  color: #777;
  font-weight: 600;
  min-width: 110px;
}

.save-btn {
  font-weight: 600;
  min-width: 120px;
  transition: background-color 0.3s ease;
}

.p-fileupload-basic{
  justify-content: flex-start;
}

.preview-image img,
.preview-audio audio {
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 12px;
}

.point-edit-dialog {
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0px 40px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
  }

  .full-width {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .point-edit-dialog .form-grid {
    grid-template-columns: 1fr;
    
    .full-width {
      grid-column: span 1;
    }
  }

  .points-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .add-point-btn {
    width: 100%;
    max-width: 300px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>