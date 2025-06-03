<template>
  <div class="route-builder">
    <!-- Список маршрутов -->
    <div v-if="mode === 'list'" class="route-list">
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
    
    <!-- Редактирование маршрута -->
    <div v-if="mode === 'edit'" class="route-edit">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text back-button"
        @click="mode = 'list'"
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
            @click="mode = 'list'"
          />
          <Button 
            label="Сохранить" 
            icon="pi pi-check"
            class="save-btn"
            @click="saveRoute"
          />
        </div>
      </div>
    </div>
    
    <!-- Редактирование точки -->
    <div v-if="mode === 'point'" class="point-edit">
      <Button 
        icon="pi pi-arrow-left" 
        class="p-button-text back-button"
        @click="mode = 'edit'"
      />
      
      <div class="edit-form">
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
              />
            </div>
          </div>
          
          <div class="form-section full-width">
            <div class="form-group">
              <label>Задание</label>
              <Textarea 
                v-model="currentPoint.taskText" 
                placeholder="Опишите задание" 
                rows="3" 
                autoResize
              />
            </div>

            <!-- Для изображения -->
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
                <img :src="currentPoint.filePath" alt="Preview" />
              </div>
            </div>

            <!-- Для аудио -->
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
              <label>Правильный ответ</label>
              <InputText 
                v-model="currentPoint.correctAnswer" 
                placeholder="Введите правильный ответ"
              />
            </div>
            
            <div class="form-group">
              <label>Сообщение при успехе</label>
              <Textarea 
                v-model="currentPoint.successMessage" 
                placeholder="Введите сообщение" 
                rows="3" 
                autoResize
              />
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <Button 
            label="Отмена" 
            class="p-button-text cancel-btn"
            @click="mode = 'edit'"
          />
          <Button 
            label="Сохранить" 
            icon="pi pi-check"
            class="save-btn"
            @click="savePoint"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: routes, refresh } = useFetch('/api/routes')

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

const uploadUrl = computed(() => `/api/upload?type=${currentPoint.value.taskType}`)

const currentPoint = ref(createEmptyPoint())

const mode = ref('list') // 'list', 'edit', 'point'

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

// Создать новый маршрут
function createRoute() {
  routeForm.value = { 
    id: null, 
    routeNumber: '', 
    points: [] 
  }
  mode.value = 'edit'
}

// Редактировать существующий
async function editRoute(route) {
  try {
    const data = await $fetch(`/api/routes/${route.id}`)
    routeForm.value = { ...data }
    mode.value = 'edit'
  } catch (error) {
    console.error('Ошибка при загрузке маршрута:', error)
    // Можно добавить Toast уведомление об ошибке
  }
}

// Сохранить маршрут
async function saveRoute() {
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
    
    mode.value = 'list'
    await refresh()
  } catch (error) {
    console.error('Ошибка при сохранении маршрута:', error)
  }
}

// Удалить маршрут
async function deleteRoute(id) {
  try {
    if (confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      await $fetch(`/api/routes/${id}`, { method: 'DELETE' })
      await refresh()
    }
  } catch (error) {
    console.error('Ошибка при удалении маршрута:', error)
    // Можно добавить Toast уведомление об ошибке
  }
}

// Добавить/редактировать точку
function editPoint(point = null) {
  if (point) {
    currentPoint.value = { 
      ...point,
      uploadedFile: null // Сбрасываем загружаемый файл
    }
  } else {
    currentPoint.value = createEmptyPoint()
  }
  mode.value = 'point'
}

// Сохранить точку
async function savePoint() {
  // Сохраняем точку в маршруте
  const savedPoint = { ...currentPoint.value }
  delete savedPoint.uploadedFile // Удаляем временное поле

  if (currentPoint.value.id) {
    const index = routeForm.value.points.findIndex(p => p.id === currentPoint.value.id)
    routeForm.value.points[index] = savedPoint
  } else {
    routeForm.value.points.push({
      ...savedPoint,
      id: Date.now() // Временный ID для UI
    })
  }
  
  mode.value = 'edit'
}

// Удалить точку
function deletePoint(id) {
  if (confirm('Вы уверены, что хотите удалить эту точку?')) {
    routeForm.value.points = routeForm.value.points.filter(p => p.id !== id)
  }
}

function isImage(url) {
  return /\.(jpeg|jpg|gif|png|webp)$/i.test(url)
}

function isAudio(url) {
  return /\.(mp3|wav|ogg)$/i.test(url)
}

function onFileUpload(event) {
  const file = event.files?.[0] || event.target?.files?.[0]
  if (!file) return

  console.log(event)
  
  try {
    // Ответ сервера содержится в xhr.response
    const response = JSON.parse(event.xhr.response);
    if (response.filePath) { // или response.filePath в зависимости от вашего API
      currentPoint.value.filePath = response.filePath;
      currentPoint.value.fileSize = response.fileSize;
      currentPoint.value.mimeType = response.mimeType;
      
      // Очищаем временный blob URL
      if (event.files?.[0]?.objectURL) {
        URL.revokeObjectURL(event.files[0].objectURL);
      }
    }
  } catch (error) {
    console.error('Ошибка обработки загруженного файла:', error);
  }
}

</script>

<style scoped>
.route-builder {
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
  height: 40px;
  font-weight: 600;
}

.routes-table,
.points-table {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
}

/* Таблица */
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

/* Редактирование маршрута и точки */
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

/* Формы точек */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px 40px;
}

.form-section {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 2;
}

/* Заголовок секции точек */
.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px;
}

.add-point-btn {
  height: 36px;
  font-weight: 600;
}

/* Кнопки действий */
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
  background-color: var(--primary-color, #3f51b5);
  color: white;
  font-weight: 600;
  min-width: 120px;
  box-shadow: 0 3px 8px rgb(63 81 181 / 0.4);
  transition: background-color 0.3s ease;
}

.save-btn:hover {
  background-color: #2c387e;
}

/* Превью изображений и аудио */
.preview-image img,
.preview-audio audio {
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 12px;
}

/* Мобильная адаптивность */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .header,
  .points-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .create-button,
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
  .actions {
    justify-content: flex-start;
  }
}

</style>