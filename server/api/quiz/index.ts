import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const { teamPassword } = getQuery(event)
    
    if (!teamPassword) {
      throw createError({ statusCode: 400, message: 'Password is required' })
    }

    const team = await prisma.team.findUnique({
      where: { password: teamPassword },
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
      score: team.score || 0
    }
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const { teamId, pointId, answer, attempts } = body

    if (!teamId || !pointId || !answer) {
      throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    // Get the point details
    const point = await prisma.point.findUnique({
      where: { id: pointId },
      select: { correctAnswer: true }
    })

    if (!point) {
      throw createError({ statusCode: 404, message: 'Point not found' })
    }

    const isCorrect = answer.toLowerCase() === point.correctAnswer.toLowerCase()
    let scoreIncrement = 0
    let isFinished = false

    if (isCorrect) {
      scoreIncrement = calculateScore(attempts)
      
      const team = await prisma.team.update({
        where: { id: teamId },
        data: {
          score: { increment: scoreIncrement },
          currentPoint: { increment: 1 }
        },
        include: {
          route: {
            select: {
              points: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      })

      isFinished = team.currentPoint > team.route.points.length
    }

    return {
      isCorrect,
      correctAnswer: point.correctAnswer,
      newScore: scoreIncrement,
      isFinished
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})

function calculateScore(attempts: number): number {
  const maxScore = 100
  return Math.floor(maxScore / Math.pow(2, attempts))
}