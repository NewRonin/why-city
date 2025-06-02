<template>
  <div class="space-y-4">
    <div v-for="(field, index) in fields" :key="index">
      <label class="block mb-1 font-medium">{{ field.label }}</label>

      <InputText v-if="field.type === 'text'" v-model="formData[field.name]" :placeholder="field.placeholder" />

      <InputNumber v-else-if="field.type === 'number'" v-model="formData[field.name]" :placeholder="field.placeholder" :useGrouping="false" />

      <FileUpload
        v-else-if="field.type === 'file'"
        mode="basic"
        name="file"
        :auto="true"
        :customUpload="true"
        @uploader="(e) => handleFileUpload(field.name, e)"
        chooseLabel="Выбрать файл"
      />

      <Dropdown
        v-else-if="field.type === 'select'"
        v-model="formData[field.name]"
        :options="field.options"
        optionLabel="label"
        optionValue="value"
        :placeholder="field.placeholder"
      />

      <!-- Дополнительные типы полей можно добавить по аналогии -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Object,
  fields: Array as () => Array<{
    name: string
    label: string
    type: 'text' | 'number' | 'file' | 'select'
    placeholder?: string
    options?: Array<{ label: string, value: any }>
  }>
})

const emit = defineEmits(['update:modelValue'])
const formData = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  formData.value = { ...val }
})

watch(formData, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

function handleFileUpload(fieldName: string, event: any) {
  const file = event.files[0]
  if (file) {
    formData.value[fieldName] = file
  }
}
</script>
