import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  // GET запрос - возвращаем все страницы или конкретную
  if (event.method === 'GET') {
    const { pageName } = getQuery(event)
    
    if (pageName) {
      const page = await prisma.modulesAccess.findUnique({
        where: { pageName: String(pageName) }
      })
      return { pageName, isEnabled: page?.isEnabled ?? true }
    }
    
    return await prisma.modulesAccess.findMany()
  }
  
  // POST запрос - обновляем состояние страницы
  if (event.method === 'POST') {
    const { pageName, isEnabled } = await readBody(event)
    
    if (!pageName) {
      throw createError({
        statusCode: 400,
        message: 'pageName is required'
      })
    }
    
    try {
      // Пытаемся обновить существующую запись
      const updatedPage = await prisma.modulesAccess.update({
        where: { pageName },
        data: { isEnabled }
      })
      return updatedPage
    } catch (error) {
      // Если запись не найдена - создаем новую
      if (error.code === 'P2025') {
        const newPage = await prisma.modulesAccess.create({
          data: {
            pageName,
            isEnabled
            // Не включаем createdAt/updatedAt, так как они должны быть автоматическими
          }
        })
        return newPage
      }
      throw error
    }
  }
  
  throw createError({
    statusCode: 405,
    message: 'Method Not Allowed'
  })
})