import { defineStore } from 'pinia'

export const useMainStore = defineStore('quiz', {
  state: () => ({
    score: 0,
    user: '',
    password: '', 
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
    },
    setPassword(password: string) {
      this.password = password
      const passwordCookie = useCookie('quiz_password')
      passwordCookie.value = password
    },
    loadPasswordFromCookie() {
      const passwordCookie = useCookie('quiz_password')
      if (passwordCookie.value) {
        this.password = passwordCookie.value
      }
    },
    clearPassword() {
      this.password = ''
      const passwordCookie = useCookie('quiz_password')
      passwordCookie.value = null
    },
  },
})
