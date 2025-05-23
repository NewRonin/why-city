import { defineStore } from 'pinia'

export const useMainStore = defineStore('quiz', {
  state: () => ({
    score: 0,
    user: '',
  }),
  actions: {
    resetScore() {
      this.score = 0
    },
    addPoints(points: number) {
      this.score += points
    },
    setUser(name: string) {
        this.user = name
    }
  },
})
