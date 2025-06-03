import { createWriteStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadDir = resolve(__dirname, '../../../public/uploads')


// Создаем директорию для загрузок, если её нет
mkdirSync(uploadDir, { recursive: true })

export default defineEventHandler(async (event) => {
  const type = getQuery(event).type 
  const files = await readMultipartFormData(event)

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg']
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  if (!files || !files.length) {
    throw createError({ statusCode: 400, message: 'Файл не предоставлен' })
  }
  
  const file = files[0]
  const extension = file.filename?.split('.').pop() || 'bin'
  const filename = `${randomUUID()}.${extension}`
  const filepath = resolve(uploadDir, filename)

  if (type === 'image' && !allowedImageTypes.includes(file.type)) {
    throw createError({ statusCode: 400, message: 'Недопустимый тип изображения' })
  }

  if (type === 'audio' && !allowedAudioTypes.includes(file.type)) {
    throw createError({ statusCode: 400, message: 'Недопустимый тип аудиофайла' })
  }

  if (file.data.length > maxFileSize) {
    throw createError({ statusCode: 400, message: 'Файл слишком большой' })
  }
  
  // Сохраняем файл
  await new Promise((resolve, reject) => {
    console.log('Saving file to:', filepath)
    const stream = createWriteStream(filepath)
    stream.write(file.data)
    stream.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
  
  // Возвращаем URL для доступа к файлу
  return {
    filePath: `/uploads/${filename}`,
    mimeType: file.type,
    fileSize: file.data.length
  }
})