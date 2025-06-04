import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const { username, password } = await readBody(event)
  
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  // Проверяем есть ли вообще какие-то админы в базе
  const adminsCount = await prisma.admin.count()
  
  // Если админов нет - создаем первого с введенными данными
  if (adminsCount === 0) {
    await prisma.admin.create({
      data: { username, password }
    })
    
    return { 
      name: username,
      message: 'First admin created and logged in successfully' 
    }
  }

  // Если админы есть - проверяем учетные данные
  const admin = await prisma.admin.findUnique({ 
    where: { username } 
  })

  if (!admin || admin.password !== password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  return { 
    name: admin.username,
    message: 'Authentication successful' 
  }
})