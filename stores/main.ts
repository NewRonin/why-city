import { defineStore } from 'pinia'

export const useMainStore = defineStore('quiz', {
  state: () => ({
    score: 0,
    user: '',
    password: '',
    adminPassword: '',
    isAdmin: false,
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
    setAdminPassword(password: string) {
      this.adminPassword = password
      const adminPasswordCookie = useCookie('quiz_admin_password')
      adminPasswordCookie.value = password
    },
    setIsAdmin(isAdmin: boolean) {
      this.isAdmin = isAdmin
    },
    loadPasswordFromCookie() {
      const passwordCookie = useCookie('quiz_password');
      const adminPasswordCookie = useCookie('quiz_admin_password');
      
      if (passwordCookie.value) {
        this.password = passwordCookie.value;
      }
      if (adminPasswordCookie.value) {
        this.adminPassword = adminPasswordCookie.value;
        this.isAdmin = true;
      }
    },
    
    clearPassword() {
      this.password = '';
      this.adminPassword = '';
      this.isAdmin = false;
      
      useCookie('quiz_password').value = null;
      useCookie('quiz_admin_password').value = null;
    },
  },
})