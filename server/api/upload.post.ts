import { createWriteStream } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const uploadDir = resolve(process.cwd(), 'public/uploads')

// Создаем директорию, если не существует
mkdirSync(uploadDir, { recursive: true })

export default defineEventHandler(async (event) => {
  const { type } = getQuery(event)
  const files = await readMultipartFormData(event)

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg']
  const maxFileSize = 10 * 1024 * 1024 // 10 MB

  if (!files || !files.length) {
    throw createError({ statusCode: 400, message: 'Файл не предоставлен' })
  }

  const file = files[0]

  if (!file.type || !file.data) {
    throw createError({ statusCode: 400, message: 'Неверный формат файла' })
  }

  if (type === 'image' && !allowedImageTypes.includes(file.type)) {
    throw createError({ statusCode: 400, message: 'Недопустимый тип изображения' })
  }

  if (type === 'audio' && !allowedAudioTypes.includes(file.type)) {
    throw createError({ statusCode: 400, message: 'Недопустимый тип аудиофайла' })
  }

  if (file.data.length > maxFileSize) {
    throw createError({ statusCode: 400, message: 'Файл слишком большой' })
  }

  const extension = file.filename?.split('.').pop()?.toLowerCase() || 'bin'
  const filename = `${randomUUID()}.${extension}`
  const filepath = resolve(uploadDir, filename)

  try {
    console.log(`Saving file to: ${filepath}`)
    const readable = Readable.from(file.data)
    await pipeline(readable, createWriteStream(filepath))
  } catch (err) {
    console.error('Ошибка при сохранении файла:', err)
    throw createError({ statusCode: 500, message: 'Ошибка при сохранении файла' })
  }

  return {
    filePath: `/uploads/${filename}`,
    mimeType: file.type,
    fileSize: file.data.length,
  }
})
