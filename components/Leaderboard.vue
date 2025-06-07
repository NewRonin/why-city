<template>
  <ClientOnly>
    <div class="leaderboard-container dark-theme">
        <h2>Таблица лидеров</h2>
        <div class="leaderboard-cards">
        <div 
            v-for="(team, index) in displayTeams" 
            :key="team.id"
            :class="['leaderboard-card', `priority-${Math.min(index + 1, 4)}`]"
            :ref="el => cardRefs[index] = el"
        >
            <div class="position-badge">{{ team.position }}</div>
            <div class="team-name">{{ team.name }}</div>
            <div class="time-value">{{ team.time === 'In progress' ? '--:--' : team.displayTime }}</div>
            <div class="score-value">{{ team.displayScore }}$</div>
        </div>
        </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps({
  teams: {
    type: Array,
    required: true
  }
})

const teamsData = ref([])
const displayTeams = ref([])
const cardRefs = ref([])

watch(
  () => props.teams,
  (newTeams) => {
    teamsData.value = newTeams
    displayTeams.value = initDisplayTeams()
    nextTick(() => animateCards())
  },
  { immediate: true }
)

function initDisplayTeams() {
  return teamsData.value.map((team) => {
    let targetTimeValue = 0
    
    if (team.isFinished && team.time !== 'In progress') {
      // Split MM:SS format
      const [minutes, seconds] = team.time.split(':').map(Number)
      targetTimeValue = minutes * 60 + seconds
    }

    return {
      ...team,
      displayTime: team.isFinished ? '00:00' : 'In progress',
      displayScore: 0,
      targetScore: team.score,
      targetTimeValue,
      // Keep original values
      originalTime: team.time
    }
  })
}

const animateCards = () => {
  gsap.set(cardRefs.value, {
    y: 100,
    opacity: 0,
    height: 0,
    marginBottom: 0
  })

  gsap.to(cardRefs.value, {
    duration: 0.7,
    y: 0,
    opacity: 1,
    height: (index) => getCardHeight(index + 1),
    marginBottom: 12,
    stagger: {
      each: 0.1,
      from: "end",
      ease: "back.out(1.2)"
    },
    onComplete: animateNumbers
  })
}

const animateNumbers = () => {
  displayTeams.value.forEach((team) => {
    gsap.to(team, {
      displayScore: team.targetScore,
      duration: 1.5,
      snap: { displayScore: 1 },
      ease: "power2.out"
    })

    // Only animate time for finished teams
    if (team.isFinished) {
      const timeObj = { value: 0 }
      gsap.to(timeObj, {
        value: team.targetTimeValue,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          const minutes = Math.floor(timeObj.value / 60)
          const seconds = Math.floor(timeObj.value % 60)
          team.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        },
        onComplete: () => {
          team.displayTime = team.originalTime
        }
      })
    }
  })
}

const getCardHeight = (position) => {
  const heights = { 1: 110, 2: 100, 3: 90, 4: 80 }
  return heights[Math.min(position, 4)] || heights[4]
}
</script>


<style scoped lang="scss">
.leaderboard-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.dark-theme {
  --bg-color: #1a1a1a;
  --card-bg: #2d2d2d;
  --hover-color: #383838;
}

h2 {
  color: var(--text-color);
  font-family: GTA;
  margin: 0 0 25px 0;
  text-align: center;
  font-size: 4rem;
  font-weight: 500;
  letter-spacing: 1px;
}

.leaderboard-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.leaderboard-card {
  position: relative;
  background: var(--card-bg);
  border-radius: 10px;
  padding: 15px 20px;
  color: var(--text-color);
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 95%;
  display: grid;
  grid-template-columns: 20px 1fr 90px 90px;
  align-items: center;
  overflow: hidden;
}

/* Размеры карточек */
.priority-1 {
  height: 100px;
  font-size: 1.8rem;
  border-left: 5px solid var(--hostel-500);
  .position-badge { background: var(--hostel-500); color: white; }
}

.priority-2 {
  height: 90px;
  font-size: 1.6rem;
  border-left: 4px solid var(--hostel-400);
  .position-badge { background: var(--hostel-400); color: white; }
}

.priority-3 {
  height: 80px;
  font-size: 1.4rem;
  border-left: 3px solid var(--hostel-300);
  .position-badge { background: var(--hostel-300); color: white; }
}

.priority-4 {
  height: 70px;
  font-size: 1.2rem;
  border-left: 2px solid var(--hostel-200);
}

.leaderboard-card:hover {
  background: var(--hover-color);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.position-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 1.6rem;
  font-weight: 800;
  font-size: 1.2rem;
  background: #3a3a3a;
}

.team-name {
  font-weight: 600;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  padding-right: 10px;
}

.time-value {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
}

.time-value {
  opacity: 0.9;
  font-size: 0.9em;
  padding-right: 15px;
}

.score-value {
  color: var(--accent-color);
  font-family: GTA;
  font-weight: 300;
  font-size: 2rem;
  transform: scale(1.1);
  transform-origin: right center;
}

/* Специальные стили для первых мест */
.priority-1 {
  .position-badge { width: 20px; height: 20px; font-size: 1.5rem; }
  .score-value { font-size: 3.6rem; }
}

.priority-2 {
  .position-badge { width: 20px; height: 20px; font-size: 1.4rem; }
  .score-value { font-size: 3rem; }
}

.priority-3 {
  .position-badge { width: 20px; height: 20px; font-size: 1.3rem; }
  .score-value { font-size: 2.4rem; }
}

.position-badge {
    width: 20px;
    height: 20px;
    font-size: 1.1rem;
  }

@media (max-width: 768px) {
  .leaderboard-card {
    grid-template-columns: 20px 1fr 70px 70px;
    padding: 12px 15px;
    width: 98%;
  }
  
  .priority-1 { height: 90px; font-size: 2.1rem; }
  .priority-2 { height: 80px; font-size: 2rem }
  .priority-3 { height: 75px; font-size: 1.8rem }
  .priority-4 { height: 65px; font-size: 1.6rem }
  
  .time-value {
    padding-right: 10px;
  }
}

@media (max-width: 480px) {
  .leaderboard-card {
    grid-template-columns: 2rem 1fr 6rem 7rem;
    padding: 10px 12px;
    gap: 8px;

    .team-name{
        font-size: 1.6rem;
    }
  }
  
  
  .score-value {
    transform: scale(1);
  }
}
</style>