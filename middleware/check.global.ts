import { useMainStore } from "@/stores/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore();
  store.loadPasswordFromCookie();
  
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
    return navigateTo('/login');
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
  } catch (error) {
    store.clearPassword();
    return navigateTo('/login');
  }
});