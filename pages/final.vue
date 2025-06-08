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
            address="ул. Почаинская, 17с, Нижний Новгород"
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

    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from "primevue/button";
import confetti from 'canvas-confetti';

const isRevealed = ref(false);
const confettiCanvas = ref<HTMLCanvasElement | null>(null);

const revealLocation = () => {
  isRevealed.value = true;
  
  // Запускаем анимации
  setTimeout(() => {
    fireConfetti();
  }, 600); // После начала анимации перехода
};

const fireConfetti = () => {
  if (confettiCanvas.value) {
    const myConfetti = confetti.create(confettiCanvas.value, {
      resize: true,
      useWorker: true
    });

    myConfetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Дополнительные эффекты
    setTimeout(() => {
      myConfetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      
      myConfetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 300);
  }
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
    position: relative;
    z-index: 2;
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
  transform: translateY(0);
  transition: transform 0.4s ease;
  
  .revealed & {
    transform: translateY(-20px);
  }
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
      transition: all 0.3s ease;
    }
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.reveal-button {
  font-size: 1.6rem;
  width: 100%;
  padding: 1.5rem 3rem;
  border-radius: 1rem;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.98);
  }
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
  background: url('/public/final.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  
  &.active {
    transform: translateY(0);
    opacity: 1;
    
    .venue-title {
      animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }
    
    .venue-subtitle {
      animation: fadeInUp 0.6s ease 0.3s both;
    }
    
    .location-info {
      animation: fadeIn 0.8s ease 0.5s both;
    }
  }
  
  .location-content {
    max-width: 90rem;
    width: 100%;
    background-color: rgba(46, 46, 46, 0.9);
    border-radius: 1.6rem;
    padding: 2.4rem;
    box-shadow: 0 0.4rem 1.6rem rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transform: scale(0.95);
    transition: transform 0.4s ease;
    
    .active & {
      transform: scale(1);
    }
  }
}

.venue-title {
  font-family: GTA;
  font-weight: 400;
  font-size: clamp(1.8rem, 8dvw, 6rem);
  margin-bottom: 2.4rem;
  color: var(--light-white);
  text-align: center;
  text-transform: uppercase;
  transform: scale(0.8);
  opacity: 0;
}

.venue-subtitle {
  font-family: GTA;
  font-weight: 400;
  font-size: clamp(1.8rem, 8dvw, 4rem);
  margin-bottom: 2.4rem;
  color: var(--light-white);
  text-align: center;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(20px);
}

.location-info {
  margin-bottom: 2.4rem;
  opacity: 0;
  
  .address-link {
    font-size: 1.6rem;
    transition: color 0.3s ease;
    text-decoration: none;
    display: block;
    text-align: center;
    margin-top: 1.6rem;
    color: var(--light-white);
    
    &:hover {
      color: var(--hostel-400);
    }
  }
}

.hide-button {
  width: 100%;
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--hostel-400);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

  .venue-subtitle {
    font-size: clamp(1.6rem, 16dvw, 4rem);
  }
}
</style>