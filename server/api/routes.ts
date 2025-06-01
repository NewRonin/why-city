import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const routes = await prisma.route.findMany({
    include: {
      points: true,
    }
  })

  return routes
})
