import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        route: {
          select: {
            routeNumber: true
          }
        }
      },
      orderBy: [
        { score: 'desc' } // Primary sort by score
      ]
    })

    // In your API endpoint
    const leaderboard = teams.map((team) => {
      let formattedTimeTaken = 'In progress'
      let isFinished = false
      let rawTime = Infinity

      if (team.startTime && team.finishTime) {
        const timeTakenMs = new Date(team.finishTime).getTime() - new Date(team.startTime).getTime()
        isFinished = true
        rawTime = timeTakenMs
        
        const totalSeconds = Math.floor(timeTakenMs / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        
        // Always format as MM:SS for consistency
        formattedTimeTaken = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }

      return {
        id: team.id,
        name: team.name,
        routeNumber: team.route.routeNumber,
        currentPoint: team.currentPoint,
        score: team.score,
        time: formattedTimeTaken, // Will be either "MM:SS" or "In progress"
        isFinished,
        rawTime
      }
    })
    // Final sorting - finished teams first (by time then score), then unfinished (by score)
    .sort((a, b) => {
      // Both teams finished - sort by time then score
      if (a.isFinished && b.isFinished) {
        if (a.rawTime !== b.rawTime) {
          return a.rawTime - b.rawTime
        }
        return b.score - a.score
      }
      // Only one team finished - finished comes first
      if (a.isFinished !== b.isFinished) {
        return a.isFinished ? -1 : 1
      }
      // Both unfinished - sort by score
      return b.score - a.score
    })
    // Add positions after final sorting
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