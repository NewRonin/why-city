import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const id = getRouterParam(event, 'id')

  // GET /api/admins - все админы
  if (method === 'GET' && !id) {
    return await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
      }
    })
  }

  // GET /api/admins/:id - конкретный админ
  if (method === 'GET' && id) {
    const admin = await prisma.admin.findUnique({
      where: { id: Number(id) },
      select: { id: true, username: true }
    })
    if (!admin) throw createError({ statusCode: 404 })
    return admin
  }

  // POST /api/admins - создать админа
  if (method === 'POST') {
    const { username, password } = await readBody(event)
    if (!username || !password) throw createError({ statusCode: 400 })
    return await prisma.admin.create({ data: { username, password } })
  }

  // PUT /api/admins/:id - обновить админа
  if (method === 'PUT' && id) {
    const { username, password } = await readBody(event)
    return await prisma.admin.update({
      where: { id: Number(id) },
      data: { username, password }
    })
  }

  // DELETE /api/admins/:id - удалить админа
  if (method === 'DELETE' && id) {
    await prisma.admin.delete({ where: { id: Number(id) } })
    return { success: true }
  }

  throw createError({ statusCode: 405 })
})