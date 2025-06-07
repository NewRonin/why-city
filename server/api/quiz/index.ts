import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const { teamPassword } = getQuery(event)

  if (!teamPassword) {
    throw createError({ statusCode: 400, message: 'Missing team password' })
  }

  // GET: получить текущее состояние
  if (event.method === 'GET') {
    const team = await prisma.team.findFirst({
      where: { password: String(teamPassword) },
      include: {
        route: {
          include: {
            points: {
              orderBy: { order: 'asc' },
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
                successMessage: true,
                order: true
              }
            }
          }
        }
      }
    })

    if (!team) throw createError({ statusCode: 404, message: 'Team not found' })

    if (!team.startTime) {
      await prisma.team.update({
        where: { id: team.id },
        data: { startTime: new Date() },
      });
    }

    const currentPoint = team.route.points.find(p => p.order === team.currentPoint);
    const totalPoints = team.route.points.length;

    // Получить попытки по текущей точке
    let attemptsUsed = 0
    if (currentPoint) {
      const attempt = await prisma.attempt.findUnique({
        where: {
          teamId_pointId: {
            teamId: team.id,
            pointId: currentPoint.id
          }
        }
      })
      attemptsUsed = attempt?.attempts || 0
    }

    const isFinished = team.currentPoint > totalPoints

    if (isFinished && !team.finishTime) {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            finishTime: new Date(),
          },
        });
      }

    return {
      questions: team.route.points,
      currentPoint: team.currentPoint,
      score: team.score || 0,
      attemptsUsed,
      isFinished,
    }
  }

  // POST: отправка ответа на текущую точку
  if (event.method === 'POST') {
    const body = await readBody(event)
    const { pointId, answer } = body

    if (!pointId || !answer) {
      throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    const team = await prisma.team.findFirst({
      where: { password: String(teamPassword) },
      select: { id: true, currentPoint: true, routeId: true, score: true }
    })

    if (!team) throw createError({ statusCode: 404, message: 'Team not found' })

    const pointList = await prisma.point.findMany({
      where: { routeId: team.routeId },
      orderBy: { order: 'asc' }
    })

    const point = pointList[team.currentPoint - 1]

    console.log(team.currentPoint, point.correctAnswer)

    if (!point || point.id !== pointId) {
      throw createError({ statusCode: 403, message: 'Invalid point access' })
    }

    // Обновляем/создаём попытку
    const attempt = await prisma.attempt.upsert({
      where: {
        teamId_pointId: {
          teamId: team.id,
          pointId: pointId
        }
      },
      update: { attempts: { increment: 1 } },
      create: { teamId: team.id, pointId, attempts: 1 }
    })

    const isCorrect = answer.trim().toLowerCase() === point.correctAnswer.trim().toLowerCase()

    if (isCorrect) {
      const scoreIncrement = calculateScore(attempt.attempts)
      const updatedTeam = await prisma.team.update({
        where: { id: team.id },
        data: {
          score: { increment: scoreIncrement },
          currentPoint: { increment: 1},
        }
      })

      const isFinished = team.currentPoint > pointList.length

      if (isFinished && !team.finishTime) {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            finishTime: new Date(),
          },
        });
      }

      return {
        isCorrect: true,
        newScore: scoreIncrement,
        isFinished,
        successMessage: point.successMessage || '',
      }
    } else {
      const maxAttempts = 3
      const used = attempt.attempts
      return {
        isCorrect: false,
        newScore: 0,
        correctAnswer: used >= maxAttempts ? point.correctAnswer : undefined,
        isFinished: false
      }
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})

function calculateScore(attempts: number): number {
  const maxScore = 100
  return Math.floor(maxScore / Math.pow(2, attempts - 1))
}
