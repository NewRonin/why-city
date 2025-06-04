import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { password } = await readBody(event)
    
    // Валидация входных данных
    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is required',
        data: { field: 'password' }
      })
    }
    
    if (typeof password !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be a string',
        data: { field: 'password' }
      })
    }
    
    // Поиск команды в базе данных
    const team = await prisma.team.findFirst({
      where: { password }
    })
    
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found or incorrect password',
        data: { suggestion: 'Check your password and try again' }
      })
    }
    
    // Удаляем пароль из ответа
    const { password: _, ...teamWithoutPassword } = team
    
    return teamWithoutPassword
    
  } catch (error: any) {
    // Если ошибка уже обработана (имеет statusCode), просто пробрасываем её
    if (error.statusCode) {
      throw error
    }
    
    // Логирование ошибки для разработки
    console.error('Team authentication error:', error.message)
    
    // Обработка специфических ошибок Prisma
    
    // Общая ошибка сервера
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})