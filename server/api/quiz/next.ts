import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  if (event.req.url?.endsWith("/api/quiz/next") && event.req.method === "POST") {
    const body = await readBody(event);
    const { teamPassword } = body;

    if (!teamPassword) {
      throw createError({ statusCode: 400, statusMessage: "Missing team password" });
    }

    // Находим команду по паролю, включая маршрут и точки
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
    const currentOrder = team.currentPoint || points[0]?.order || 1;

    // Ищем индекс текущей точки по порядку
    const currentIndex = points.findIndex(p => p.order === currentOrder);
    if (currentIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: "Current point not found" });
    }

    const nextIndex = currentIndex + 1;

    // Если это была последняя точка — квест завершён
    if (nextIndex >= points.length) {
        // Обнуляем или фиксируем currentPoint на последней
        await prisma.team.update({
            where: { id: team.id },
            data: {
            currentPoint: points.length,
            finishTime: new Date(), // Set finish time
            },
        });

        return {
            isFinished: true,
            newCurrentPointOrder: currentOrder,
            newScore: team.score,
        };
    }


    // Обновляем у команды currentPoint на следующий по порядку
    await prisma.team.update({
      where: { id: team.id },
      data: {
        currentPoint: points[nextIndex].order,
      },
    });

    return {
      isFinished: false,
      newCurrentPointOrder: points[nextIndex].order,
      newScore: team.score,
    };
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
