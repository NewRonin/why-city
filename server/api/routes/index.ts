import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  // GET - Получение всех маршрутов
  if (event.method === 'GET') {
    return await prisma.route.findMany({
      include: { points: true }
    })
  }

  // POST - Создание нового маршрута
  if (event.method === 'POST') {
    const body = await readBody(event)
    
    return await prisma.route.create({
      data: {
        routeNumber: body.routeNumber,
        points: {
          create: body.points
        }
      },
      include: { points: true }
    })
  }

  // PUT - Обновление маршрута
  if (event.method === 'PUT') {
    const body = await readBody(event)
    
    if (!body.id) throw createError({ statusCode: 400, message: 'ID маршрута обязателен' })

    // Удаляем точки, которых нет в новом списке
    await prisma.point.deleteMany({
      where: {
        routeId: body.id,
        id: { notIn: body.points.filter(p => p.id).map(p => p.id) }
      }
    })
    
    // Обновляем или создаем точки
    await Promise.all(body.points.map(point => {
      if (point.id) {
        return prisma.point.update({
          where: { id: point.id },
          data: {
            title: point.title,
            address: point.address,
            latitude: point.latitude,
            longitude: point.longitude,
            taskType: point.taskType,
            task: point.task,
            correctAnswer: point.correctAnswer,
            successMessage: point.successMessage
          }
        })
      } else {
        return prisma.point.create({
          data: {
            ...point,
            routeId: body.id
          }
        })
      }
    }))
    
    // Обновляем сам маршрут
    return await prisma.route.update({
      where: { id: body.id },
      data: {
        routeNumber: body.routeNumber
      },
      include: { points: true }
    })
  }

  // DELETE - Удаление маршрута
  if (event.method === 'DELETE') {
    const body = await readBody(event)
    
    if (!body.id) throw createError({ statusCode: 400, message: 'ID маршрута обязателен' })

    // Сначала удаляем точки
    await prisma.point.deleteMany({
      where: { routeId: body.id }
    })
    
    // Затем сам маршрут
    return await prisma.route.delete({
      where: { id: body.id }
    })
  }

  throw createError({ statusCode: 405, message: 'Метод не разрешен' })
})