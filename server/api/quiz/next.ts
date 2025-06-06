import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  if (event.req.url?.endsWith("/api/quiz/next") && event.req.method === "POST") {
    const body = await readBody(event);
    const { teamId, currentPointOrder } = body;

    if (!teamId || typeof currentPointOrder !== "number") {
      throw createError({ statusCode: 400, statusMessage: "Invalid request data" });
    }

    // Получаем текущую команду
    const team = await prisma.team.findUnique({
      where: { id: teamId },
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

    // Ищем индекс текущей точки по order
    const currentIndex = points.findIndex(p => p.order === currentPointOrder);
    if (currentIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: "Current point not found" });
    }

    const nextIndex = currentIndex + 1;

    // Если это была последняя точка — квест завершён
    if (nextIndex >= points.length) {
      return {
        isFinished: true,
        newCurrentPointOrder: currentPointOrder,
        newScore: team.score,
      };
    }

    // Обновляем у команды currentPoint (уже по порядку)
    await prisma.team.update({
      where: { id: teamId },
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
