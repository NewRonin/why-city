import { defineStore } from 'pinia'

function parseCookie(cookieHeader: string, name: string) {
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export const useMainStore = defineStore('quiz', {
  state: () => ({
    score: 0,
    user: '',
    password: '',
    adminLogin: '',
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
    this.password = password;
    useCookie('quiz_password', {
      secure: true, 
      sameSite: 'lax', 
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',          // Доступно на всех путях
      httpOnly: false,     // Чтобы JS мог читать куки
    }).value = password;
  },
    setAdminPassword(login: string, password: string) {
      this.adminPassword = password;
      this.adminLogin = login;
      
      const adminPassCookie = useCookie('quiz_admin_password', {
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        httpOnly: false,
      });
      
      const adminLoginCookie = useCookie('quiz_admin_login', {
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        httpOnly: false,
      });
      
      // Явно устанавливаем значения
      adminPassCookie.value = password;
      adminLoginCookie.value = login;
      
      console.log('Cookies set:', { 
        adminPass: adminPassCookie.value,
        adminLogin: adminLoginCookie.value 
      });
    },
    setIsAdmin(isAdmin: boolean) {
      this.isAdmin = isAdmin
    },
    loadPasswordFromCookie() {
      // На клиенте используем useCookie
      if (process.client) {
        const passwordCookie = useCookie('quiz_password').value;
        const adminLoginCookie = useCookie('quiz_admin_login').value;
        const adminPasswordCookie = useCookie('quiz_admin_password').value;
        
        if (passwordCookie) this.password = passwordCookie;
        if (adminPasswordCookie && adminLoginCookie) {
          this.adminPassword = adminPasswordCookie;
          this.adminLogin = adminLoginCookie;
          this.isAdmin = true;
        }
        return;
      }
      
      // На сервере парсим куки из заголовков
      const headers = useRequestHeaders(['cookie']);
      const cookies = headers.cookie || '';
      
      this.password = parseCookie(cookies, 'quiz_password') || this.password;
      this.adminLogin = parseCookie(cookies, 'quiz_admin_login') || this.adminLogin;
      this.adminPassword = parseCookie(cookies, 'quiz_admin_password') || this.adminPassword;
      
      if (this.adminPassword && this.adminLogin) {
        this.isAdmin = true;
      }
    },


    
    clearPassword() {
      this.password = '';
      this.adminPassword = '';
      this.isAdmin = false;
      
      useCookie('quiz_password').value = null;
      useCookie('quiz_admin_login').value = null;
      useCookie('quiz_admin_password').value = null;
    },
  },
})