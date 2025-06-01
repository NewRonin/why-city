import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') throw createError({ statusCode: 405 })

  const { username, password } = await readBody(event)
  if (!username || !password) throw createError({ statusCode: 400 })

  const admin = await prisma.admin.findUnique({ where: { username } })
  if (!admin || admin.password !== password) {
    throw createError({ statusCode: 401 })
  }

  return { isValid: true }
})