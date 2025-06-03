export default defineEventHandler(async (event) => {
  const { teamPassword } = getQuery(event)
  
  if (!teamPassword) {
    throw createError({ statusCode: 400, message: 'Password is required' })
  }

  // Now using findUnique since password is unique
  const team = await prisma.team.findUnique({
    where: {
      password: teamPassword
    },
    include: {
      route: {
        include: {
          points: {
            orderBy: { id: 'asc' },
            select: {
              id: true,
              title: true,
              address: true,
              latitude: true,
              longitude: true,
              taskType: true,
              taskText: true,
              filePath: true,
              fileSize: true,
              mimeType: true,
              correctAnswer: true,
              successMessage: true
            }
          }
        }
      }
    }
  })

  if (!team) {
    throw createError({ statusCode: 404, message: 'Team not found' })
  }

  return {
    questions: team.route.points,
    teamId: team.id,
    currentPoint: team.currentPoint,
    score: 0 // Add your scoring logic here
  }
})