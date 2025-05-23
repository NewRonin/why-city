import { useMainStore } from "@/stores/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useMainStore();
    if (to.name === 'index' && !store.user) {
        return navigateTo(`/login`)
    }
  })