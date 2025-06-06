import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  // GET — Получение конкретного маршрута
  if (event.method === "GET") {
    return await prisma.route.findUnique({
      where: { id },
      include: { points: { orderBy: { order: "asc" } } },
    });
  }

  // PUT — Обновление маршрута и точек
  if (event.method === "PUT") {
    const body = await readBody(event);

    const routeExists = await prisma.route.findUnique({ where: { id } });
    if (!routeExists) {
      throw createError({ statusCode: 404, statusMessage: "Маршрут не найден" });
    }

    const currentPoints = await prisma.point.findMany({ where: { routeId: id } });

    const newPointIds = body.points.filter(p => p.id).map(p => p.id);
    const pointsToDelete = currentPoints.filter(cp => !newPointIds.includes(cp.id));

    if (pointsToDelete.length > 0) {
      await prisma.point.deleteMany({
        where: { id: { in: pointsToDelete.map(p => p.id) } },
      });
    }

    const pointOperations = body.points.map(async (point) => {
      if (!Number.isFinite(point.order)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Поле "order" обязательно и должно быть конечным числом.`,
        });
      }

      const pointData = {
        title: point.title,
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
        taskType: point.taskType,
        taskText: point.taskText || "",
        correctAnswer: point.correctAnswer,
        successMessage: point.successMessage,
        filePath: point.filePath || null,
        fileSize: point.fileSize || null,
        mimeType: point.mimeType || null,
        order: point.order, // ← используем клиентский order
      };

      try {
        if (point.id && point.id < 1000000000000) {
          return await prisma.point.update({
            where: { id: point.id },
            data: pointData,
          });
        } else {
          return await prisma.point.create({
            data: {
              ...pointData,
              routeId: id,
            },
          });
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке точки ${point.id || "new"}:`, error);
        return null;
      }
    });


    await Promise.all(pointOperations);

    return await prisma.route.update({
      where: { id },
      data: { routeNumber: body.routeNumber },
      include: { points: { orderBy: { order: "asc" } } },
    });
  }

  // DELETE — Удаление маршрута и связанных точек
  if (event.method === "DELETE") {
    const route = await prisma.route.findUnique({
      where: { id },
      include: { points: true },
    });

    if (!route) {
      throw createError({ statusCode: 404, statusMessage: "Маршрут не найден" });
    }

    await prisma.$transaction([
      prisma.point.deleteMany({ where: { routeId: id } }),
      prisma.route.delete({ where: { id } }),
    ]);

    return { success: true, message: "Маршрут и точки удалены" };
  }

  throw createError({ statusCode: 405, message: "Метод не разрешен" });
});
