import { useMainStore } from "@/stores/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore();
  store.loadPasswordFromCookie();

  const allowedPages = [
    '/leaders'
  ]
  
  // Страница логина - особый случай
  if (to.path === '/login') {
    setPageLayout('empty');
    return;
  }

  // Админские роуты
  if (to.path.startsWith('/admin')) {
    setPageLayout('admin');
    
    // Если нет пароля админа - на логин
    if (!store.adminPassword) {
      return navigateTo('/login');
    }
    
    // Проверяем валидность админского пароля
    try {
      await $fetch("/api/auth/admin", {
        method: "POST",
        body: { 
          username: store.adminLogin,
          password: store.adminPassword 
        },
        headers: process.server ? { 
          cookie: useRequestHeaders(['cookie']).cookie || '' 
        } : {},
      });
      return; // Все ок, пропускаем
    } catch (error) {
      store.clearPassword();
      return navigateTo('/login');
    }
  }

  // Обычные роуты (не админские)
  if (!store.password) {
    if (allowedPages.includes(to.path) !== true) {
      return navigateTo('/login');
    }
    else {
      return
    }
  }

  // Проверяем валидность пароля пользователя
  try {
    const response = await $fetch("/api/auth/team", {
      method: "POST",
      body: { password: store.password },
      headers: process.server ? { 
        cookie: useRequestHeaders(['cookie']).cookie || '' 
      } : {},
    });
    store.setUser(response.name);
    store.score = response.score;
  } catch (error) {
    store.clearPassword();
    return navigateTo('/login');
  }
});