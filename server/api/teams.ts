import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method === 'GET') {
    const { id } = getQuery(event)
    
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }
    
    try {
      const team = await prisma.team.findUnique({
        where: { id: Number(id) },
        include: { route: { include: { points: true } } }
      })
      
      if (!team) {
        throw createError({ statusCode: 404, statusMessage: 'Team not found' })
      }
      
      // Удаляем пароль из ответа
      const { password: _, ...teamWithoutPassword } = team
      return teamWithoutPassword
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
    }
  }
  
  if (method === 'POST') {
    const { name, password, routeId } = await readBody(event)
    
    if (!name || !password || !routeId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Name, password and routeId are required' 
      })
    }
    
    try {
      return await prisma.team.create({
        data: {
          name,
          password,
          routeId: Number(routeId),
          currentPoint: 0
        }
      })
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
    }
  }
  
  if (method === 'PUT') {
    const { id, ...updateData } = await readBody(event)
    
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }
    
    try {
      return await prisma.team.update({
        where: { id: Number(id) },
        data: {
          ...updateData,
          routeId: updateData.routeId ? Number(updateData.routeId) : undefined,
          currentPoint: updateData.currentPoint ? Number(updateData.currentPoint) : undefined
        }
      })
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
    }
  }
  
  throw createError({ 
    statusCode: 405, 
    statusMessage: 'Method Not Allowed' 
  })
})