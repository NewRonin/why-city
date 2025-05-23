import { defineStore } from 'pinia'

export const useMainStore = defineStore('quiz', {
  state: () => ({
    score: 0,
  }),
  actions: {
    resetScore() {
      this.score = 0
    },
    addPoints(points: number) {
      this.score += points
    },
  },
})
