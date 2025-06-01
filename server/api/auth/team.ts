import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const { password } = await readBody(event)
  
  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'Password is required' })
  }
  
  try {
    const team = await prisma.team.findFirst({
      where: { password },
      include: { 
        route: { 
          include: { 
            points: true 
          } 
        } 
      }
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
})