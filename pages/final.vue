<template>
  <div class="party-page">
    <div class="party-container" :class="{ 'revealed': isRevealed }">
      <div class="party-content">
        <h1 class="party-title">КВЕСТ ЗАВЕРШЁН</h1>
        <div class="buttons-container">
          <Button 
            label="GDE PARTY?" 
            severity="primary"
            class="reveal-button" 
            @click="revealLocation" 
            :raised="true"
          />
          <Button 
            label="Таблица лидеров" 
            class="reveal-button" 
            @click="revealLeaders" 
            :raised="true"
          />
        </div>
      </div>
    </div>

    <div class="location-container" :class="{ 'active': isRevealed }">
      <div class="location-content">
        <h1 class="venue-title">ALCATRAZ BAR</h1>
        <h2 class="venue-subtitle">19:00</h2>
        <div class="location-info">
          <YandexMap
            :coordinates="[56.326756, 43.994888]"
            :zoom="18"
            placemark-text="GDE PARTY"
          />
          <YandexLink
            :coordinates="[56.326756, 43.994888]"
            address="Почаинская ул.,17с, Нижний Новгород"
            class="address-link"
          />
        </div>
        <Button 
          label="Скрыть" 
          class="hide-button" 
          @click="hideLocation"
          text
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from "primevue/button";

const isRevealed = ref(false);

const revealLocation = () => {
  isRevealed.value = true;
};

const revealLeaders = () => {
  navigateTo('/leaders')
};

const hideLocation = () => {
  isRevealed.value = false;
};
</script>

<style scoped lang="scss">
.party-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  max-height: calc(100dvh - 7rem);
  background-color: var(--base-black);
  overflow: hidden;
}

.party-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  padding: 2.4rem 1.6rem;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  
  &.revealed {
    transform: translateY(-100%);
    opacity: 0;
  }
  
  .party-content {
    text-align: center;
    max-width: 90rem;
    width: 100%;
  }
}

.party-title {
  font-family: GTA;
  font-weight: 400;
  font-size: clamp(2rem, 12vw, 10rem);
  margin-bottom: 4rem;
  color: var(--light-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.buttons-container {
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  height: 100%;
  gap: 1.6rem;

  .reveal-button:first-child {
    :deep(span) {
      font-size: 4rem;
      font-weight: 400;
      font-family: GTA;
    }
  }
}

.reveal-button {
  font-size: 1.6rem;
  width: 100%;
  padding: 1.5rem 3rem;
  border-radius: 1rem;
  width: 100%;
}

.location-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2.4rem 1.6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--base-black);
  background: url('final.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  
  &.active {
    transform: translateY(0);
    opacity: 1;
  }
  
  .location-content {
    max-width: 90rem;
    width: 100%;
    background-color: #2e2e2e;
    border-radius: 1.6rem;
    padding: 2.4rem;
    box-shadow: 0 0.4rem 1.6rem rgba(255, 255, 255, 0.05);
  }
}

.venue-title {
  font-family: GTA;
  font-weight: 400;
  font-size: clamp(1.8rem, 8vw, 6rem);
  margin-bottom: 2.4rem;
  color: var(--light-white);
  text-align: center;
  text-transform: uppercase;
}

.venue-subtitle {
  font-family: GTA;
  font-weight: 400;
  font-size: clamp(1.2rem, 8vw, 4rem);
  margin-bottom: 2.4rem;
  color: var(--light-white);
  text-align: center;
  text-transform: uppercase;
}


.location-info {
  margin-bottom: 2.4rem;
  
  .address-link {
    font-size: 1.6rem;
    transition: color 0.3s ease;
    text-decoration: none;
    display: block;
    text-align: center;
    margin-top: 1.6rem;
  }
}

.hide-button {
  width: 100%;
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--hostel-400)
}

@media (max-width: 768px) {
  .party-title, .venue-title {
    margin-bottom: 2rem;
  }
  
  .location-info .map {
    height: 40rem;
  }
}

@media (max-width: 480px) {
  .party-title {
    font-size: clamp(2rem, 20vw, 6rem);
  }
  
  .venue-title {
    font-size: clamp(1.6rem, 20vw, 5rem);
  }
}
</style>