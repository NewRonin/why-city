<template>
  <header class="admin-header">
    <div class="header-container">
      <div class="logo" @click="navigateTo('/admin')">
        <NuxtImg 
          src="/logo.svg"
          class="logo-image"
        />
      </div>
      
      <nav class="navigation">
        <NuxtLink 
          to="/admin/routes" 
          class="nav-link"
          active-class="active"
        >
          <i class="pi pi-map-marker"></i>
          <span>Маршруты</span>
        </NuxtLink >
        
        <NuxtLink  
          to="/admin/teams" 
          class="nav-link"
          active-class="active"
        >
          <i class="pi pi-users"></i>
          <span>Команды</span>
        </NuxtLink >
      </nav>
      
      <Button 
        icon="pi pi-user-minus" 
        class="scroll-button"
        @click="handleLogOut"
        label="Выйти"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
const store = useMainStore()

function handleLogOut() {
    store.clearPassword()
    navigateTo('/')
}

</script>

<style scoped lang="scss">
.admin-header {
  background-color: var(--surface-card);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 4rem; /* Changed from max-height to height for consistency */
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  height: 100%; /* Ensure container takes full header height */
}

.logo {
  height: 100%;
  display: flex;
  align-items: center; /* Vertically center the logo */
  cursor: pointer;
}

.logo-image {
  height: 80%; /* Adjust this percentage to get the desired size */
  width: auto; /* Maintain aspect ratio */
  max-height: 100%; /* Ensure it doesn't exceed container height */
  object-fit: contain; /* Ensure the entire image is visible */
}

.navigation {
  display: flex;
  gap: 1.5rem;
  margin-left: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: var(--text-color-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
  @include hover {
    color: var(--main);
    cursor: pointer;
  }
  
  &.active {
    background-color: var(--primary-color);
    color: var(--main);
    
    &:hover {
      background-color: var(--primary-600);
    }
  }
}

.scroll-button {
  margin-left: auto;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0.75rem 1rem;
  }
  
  .navigation {
    gap: 0.75rem;
    margin-left: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    span {
      display: none;
    }
  }
  
  .logo span {
    display: none;
  }
}
</style>