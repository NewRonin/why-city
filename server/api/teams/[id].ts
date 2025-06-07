import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method
  const teamId = Number(event.context.params?.id)
  
  if (!teamId || isNaN(teamId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Valid team ID is required'
    })
  }

  // GET /api/teams/[id]
  if (method === 'GET') {
    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { route: { include: { points: true } } }
      })
      
      if (!team) throw new Error('Team not found')
      
      const { password: _, ...teamData } = team
      return teamData
    } catch (error: any) {
      throw createError({
        statusCode: error.message === 'Team not found' ? 404 : 500,
        statusMessage: 'Error fetching team',
        message: error.message
      })
    }
  }

  // PUT /api/teams/[id]
  if (method === 'PUT') {
    try {
      const body = await readBody(event)
      
      // Валидация данных
      if (!body || typeof body !== 'object') {
        throw new Error('Invalid request body')
      }
      
      // Подготовка данных для обновления
      const updateData: any = {}
      
      if (body.name) updateData.name = body.name
      if (body.password) updateData.password = body.password
      if (body.routeId) updateData.routeId = Number(body.routeId)
      if (body.currentPoint) updateData.currentPoint = Number(body.currentPoint)
      
      // Проверка, что есть хотя бы одно поле для обновления
      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update')
      }
      
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: updateData
      })
      
      const { password: _, ...teamData } = updatedTeam
      return teamData
      
    } catch (error: any) {
      console.error('Update error:', error)
      
      // Специальная обработка ошибок Prisma
      if (error.code === 'P2025') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'Team not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Update failed',
        message: error.message || 'Could not update team'
      })
    }
  }

  // DELETE /api/teams/[id]
  if (method === 'DELETE') {
    try {
      // Delete related attempts first
      await prisma.attempt.deleteMany({
        where: { teamId },
      })

      // Now delete the team
      await prisma.team.delete({
        where: { id: teamId },
      })

      return { success: true }
    } catch (error: any) {
      console.error('Delete failed:', error)

      throw createError({
        statusCode: error.code === 'P2025' ? 404 : 500,
        statusMessage: 'Delete failed',
        message: error.message || 'Could not delete team',
      })
    }
  }


  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})