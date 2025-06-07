import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  if (event.req.url?.endsWith("/api/quiz/next") && event.req.method === "POST") {
    const body = await readBody(event);
    const { teamPassword, clientPoint } = body;

    if (!teamPassword) {
      throw createError({ statusCode: 400, statusMessage: "Missing team password" });
    }

    const team = await prisma.team.findFirst({
      where: { password: String(teamPassword) },
      include: {
        route: {
          include: {
            points: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!team) {
      throw createError({ statusCode: 404, statusMessage: "Team not found" });
    }

    const points = team.route.points;
    const currentOrder = team.currentPoint ?? points[0]?.order;
    const currentIndex = currentOrder;

    const isLastPoint = clientPoint === points.length;

    if (isLastPoint) {
      // Последняя точка
      if (!team.finishTime) {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            finishTime: new Date(),
            currentPoint: currentOrder + 1,
          },
        });
      }
        return {
          isFinished: true,
          newCurrentPointOrder: currentOrder + 1,
          newScore: team.score,
        }
    } else {
      // Не последняя точка — перейти к следующей после ответа
      const nextPoint = points[clientPoint < currentOrder ? currentIndex - 1 : currentIndex];

        await prisma.team.update({
          where: { id: team.id },
          data: {
            currentPoint: nextPoint.order,
          },
        });

        return {
          isFinished: false,
          newCurrentPointOrder: nextPoint.order,
          newScore: team.score,
        };
    }
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
