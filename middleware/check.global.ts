import { useMainStore } from "@/stores/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore();
  store.loadPasswordFromCookie();
  
  if (to.path === '/login') {
    if (!store.password) {
        return
    }
    else {
        navigateTo('/')
    }
  }
  
  if (!store.password) {
    return navigateTo('/login');
  }

  try {
    const response = await $fetch("/api/auth/team", {
      method: "POST",
      body: { password: store.password },
    });
    store.setUser(response.name);
  } catch (error) {
    store.clearPassword();
    return navigateTo('/login');
  }
  
  if (to.path !== '/') {
    return navigateTo('/');
  }
});