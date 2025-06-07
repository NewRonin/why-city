import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Получаем все команды с их маршрутами и сортируем по очкам
    const teams = await prisma.team.findMany({
      include: {
        route: {
          select: {
            routeNumber: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    })

    // Форматируем данные в нужный формат
    const leaderboard = teams.map((team, index) => ({
      id: team.id,
      position: index + 1,
      name: team.name,
      routeNumber: team.route.routeNumber,
      currentPoint: team.currentPoint,
      score: team.score
    }))

    return {
      status: 200,
      data: leaderboard
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return {
      status: 500,
      error: 'Internal Server Error'
    }
  }
})