import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {

  if (event.method === 'POST') {
   const body = await readBody(event);
    const { teamId, currentPoint } = body;

    if (!teamId || currentPoint === undefined) {
      throw createError({ statusCode: 400, message: 'Missing required fields' });
    }

    // Обновляем текущий вопрос команды
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        currentPoint: currentPoint + 1
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
    });

    const isFinished = team.currentPoint > team.route.points.length;

    return {
      newCurrentPoint: team.currentPoint,
      newScore: team.score,
      isFinished
    };
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})