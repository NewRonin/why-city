import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  // Разделяем обработку по методам
  switch (event.method) {
    case 'GET':
      return handleGetRequest(event)
    case 'POST':
      return handlePostRequest(event)
    case 'PUT':
      return handlePutRequest(event)
    case 'DELETE':
      return handleDeleteRequest(event)
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
})

async function handleGetRequest(event) {
  const query = getQuery(event)
  
  if (!query.id) {
    // GET /api/admins - список всех администраторов
    return await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        id: 'desc'
      }
    })
  } else {
    // GET /api/admins?id=1 - конкретный администратор
    const admin = await prisma.admin.findUnique({
      where: { id: Number(query.id) },
      select: { id: true, username: true }
    })
    if (!admin) throw createError({ statusCode: 404 })
    return admin
  }
}

async function handlePostRequest(event) {
  const body = await readBody(event)
  
  if (!body.username || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }
  
  return await prisma.admin.create({
    data: {
      username: body.username,
      password: body.password
    },
    select: {
      id: true,
      username: true
    }
  })
}

async function handlePutRequest(event) {
  const query = getQuery(event)
  const body = await readBody(event)
  
  if (!query.id) throw createError({ statusCode: 400 })
  if (!body.username) throw createError({ statusCode: 400 })
  
  const updateData: any = { username: body.username }
  if (body.password) updateData.password = body.password
  
  return await prisma.admin.update({
    where: { id: Number(query.id) },
    data: updateData,
    select: {
      id: true,
      username: true
    }
  })
}

async function handleDeleteRequest(event) {
  const query = getQuery(event)
  
  if (!query.id) throw createError({ statusCode: 400 })
  
  await prisma.admin.delete({ where: { id: Number(query.id) } })
  return { success: true }
}