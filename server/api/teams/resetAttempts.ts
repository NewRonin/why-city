import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const teamId = parseInt(query.teamId)

  if (isNaN(teamId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or missing teamId',
    })
  }

  try {
    const attempts = await prisma.attempt.findMany({
      where: { teamId },
    })

    if (attempts.length === 0) {
      return {
        message: `No attempts found for team ${teamId}`,
        reset: false,
      }
    }

    await prisma.$transaction(
      attempts.map((attempt) =>
        prisma.attempt.update({
          where: {
            teamId_pointId: {
              teamId: attempt.teamId,
              pointId: attempt.pointId,
            },
          },
          data: { attempts: 0 },
        })
      )
    )

    return {
      message: `✅ Attempts reset for team ${teamId}`,
      reset: true,
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
