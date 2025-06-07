import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // First fetch all teams with their route numbers
    const teams = await prisma.team.findMany({
      include: {
        route: {
          select: {
            routeNumber: true
          }
        }
      }
    })

    // Process and prepare data for sorting
    const leaderboard = teams.map(team => {
      let isFinished = false
      let timeTakenMs = Infinity // Default high value for unfinished teams
      let formattedTime = 'In progress'

      if (team.startTime && team.finishTime) {
        isFinished = true
        timeTakenMs = new Date(team.finishTime).getTime() - new Date(team.startTime).getTime()
        const totalSeconds = Math.floor(timeTakenMs / 1000)
        formattedTime = `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`
      }

      return {
        id: team.id,
        name: team.name,
        routeNumber: team.route.routeNumber,
        currentPoint: team.currentPoint,
        score: team.score,
        time: formattedTime,
        isFinished,
        timeTakenMs,
        rawScore: team.score // Using rawScore for consistent sorting
      }
    })
    .sort((a, b) => {
      // First sort by score (descending)
      if (a.rawScore !== b.rawScore) {
        return b.rawScore - a.rawScore
      }
      
      // If scores are equal, sort by time (finished teams first, then by time)
      if (a.isFinished && b.isFinished) {
        return a.timeTakenMs - b.timeTakenMs
      }
      
      // If only one is finished, it comes first
      if (a.isFinished !== b.isFinished) {
        return a.isFinished ? -1 : 1
      }
      
      // Both unfinished with same score - maintain original order
      return 0
    })
    .map((team, index) => ({
      ...team,
      position: index + 1
    }))

    return {
      status: 200,
      data: leaderboard
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return {
      status: 500,
      error: 'Internal Server Error'
    }
  }
})