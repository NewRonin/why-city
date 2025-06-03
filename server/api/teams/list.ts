import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    return await prisma.team.findMany({
      include: {
        route: {
          select: {
            routeNumber: true
          }
        }
      }
    })
  } catch (error) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error' 
    })
  }
})