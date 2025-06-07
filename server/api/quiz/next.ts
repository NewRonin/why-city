import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  if (event.req.url?.endsWith("/api/quiz/next") && event.req.method === "POST") {
    const body = await readBody(event);
    const { teamPassword, isAnswered } = body;

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
    const currentIndex = points.findIndex(p => p.order === currentOrder);

    if (currentIndex === -1) {
      throw createError({ statusCode: 500, statusMessage: "Invalid current point" });
    }

    const isLastPoint = currentIndex === points.length - 1;

    if (isLastPoint) {
      // Последняя точка
      if (isAnswered) {
        // Ответ получен — завершить квест
        await prisma.team.update({
          where: { id: team.id },
          data: {
            finishTime: new Date(),
          },
        });

        return {
          isFinished: true,
          newCurrentPointOrder: currentOrder,
          newScore: team.score,
        };
      } else {
        // Пока не отвечено — оставить на месте
        return {
          isFinished: false,
          newCurrentPointOrder: currentOrder,
          newScore: team.score,
        };
      }
    } else {
      // Не последняя точка — перейти к следующей после ответа
      if (isAnswered) {
        const nextPoint = points[currentIndex + 1];

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
      } else {
        // Не отвечено — остаёмся на текущей
        return {
          isFinished: false,
          newCurrentPointOrder: currentOrder,
          newScore: team.score,
        };
      }
    }
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
