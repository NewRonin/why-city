import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  
  // GET - Получение конкретного маршрута
  if (event.method === 'GET') {
    return await prisma.route.findUnique({
      where: { id },
      include: { points: true }
    })
  }

  // PUT - Обновление маршрута
  if (event.method === 'PUT') {
    const body = await readBody(event)
    
    // Проверяем существование маршрута
    const routeExists = await prisma.route.findUnique({
      where: { id }
    })
    
    if (!routeExists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Маршрут не найден'
      })
    }

    // Получаем текущие точки маршрута
    const currentPoints = await prisma.point.findMany({
      where: { routeId: id }
    })

    // Определяем точки для удаления (которые есть в БД, но нет в новом списке)
    const pointsToDelete = currentPoints.filter(
      cp => !body.points.some(p => p.id && p.id === cp.id)
    )

    // Удаляем точки
    if (pointsToDelete.length > 0) {
      await prisma.point.deleteMany({
        where: {
          id: { in: pointsToDelete.map(p => p.id) }
        }
      })
    }

    // Обрабатываем точки
    const pointOperations = body.points.map(async (point) => {
      try {
        // Удаляем временный ID, если он есть
        const pointData = { ...point }
        if (pointData.id && pointData.id > 1000000000000) { // Если ID похож на временный (Date.now())
          delete pointData.id
        }

        if (point.id && point.id < 1000000000000) { // Реальный ID из БД
          return await prisma.point.update({
            where: { id: point.id },
            data: {
              title: pointData.title,
              address: pointData.address,
              latitude: pointData.latitude,
              longitude: pointData.longitude,
              taskType: pointData.taskType,
              task: pointData.task,
              correctAnswer: pointData.correctAnswer,
              successMessage: pointData.successMessage
            }
          })
        } else {
          // Создаем новую точку
          return await prisma.point.create({
            data: {
              ...pointData,
              routeId: id
            }
          })
        }
      } catch (error) {
        console.error(`Ошибка при обработке точки ${point.id || 'new'}:`, error)
        return null
      }
    })

    // Выполняем операции с точками
    await Promise.all(pointOperations)

    // Обновляем сам маршрут
    return await prisma.route.update({
      where: { id },
      data: {
        routeNumber: body.routeNumber
      },
      include: { points: true }
    })
  }

  throw createError({ statusCode: 405, message: 'Метод не разрешен' })
})