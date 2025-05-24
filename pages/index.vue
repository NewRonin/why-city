<template>
  <div class="quiz-page">
    <div v-if="!isFinished" class="quiz-box">
      <div class="step-counter">
        Вопрос {{ currentStep + 1 }} из {{ riddles.length }}
      </div>

      <div class="question-location">
        <YandexMap
          :coordinates="[currentRiddle.coordinates[0], currentRiddle.coordinates[1]]"
          :zoom="12"
          placemark-text="Москва — столица России"
        />
      </div>

      <div class="question-text">
        {{ currentRiddle.question }}
      </div>

      <div class="input-wrapper">
        <InputText
          v-model="userAnswer"
          :invalid="isInvalid"
          :disabled="isAnswered || attemptsLeft === 0"
          @keyup.enter="submitAnswer"
        />
        <Button
          label=""
          @click="submitAnswer"
          :disabled="isAnswered || attemptsLeft === 0"
        >
          <template #icon>
            <i class="pi pi-check"></i>
          </template>
        </Button>
      </div>

      <div class="action-buttons">
        <Button label="Далее" @click="nextQuestion" :disabled="!isAnswered && attemptsLeft > 0" />
      </div>
    </div>
    <div v-else class="quiz-finished">
      🎉 Квест завершён! <br />
      Ваш счёт: <strong>{{ store.score }}$</strong>
    </div>

    <div class="result-message">
        <div :style="{visibility: showResult ? 'visible' : 'hidden'}">{{ resultMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { PrimeIcons } from "@primevue/core/api";
import { useMainStore } from '@/stores/main'

const maxAttempts = 3;
const maxPointsPerQuestion = 300;
const store = useMainStore()

const riddles = [
  { 
    question: "Стоит трон из лезвий, но сидеть на нём — не значит править. Что это?", 
    answer: "Железный Трон",
    coordinates: [55.751244, 37.618423] 
  },    
  { 
    question: "Красный или зелёный — в огне рождённый. Кто это?", 
    answer: "дракон",
    coordinates: [48.856613, 2.352222] 
  },  
  { 
    question: "Льётся кровь, но не в бою — решает, кто корону возьмёт свою. Что это?", 
    answer: "наследство",
    coordinates: [40.712776, -74.005974] 
  },  
  { 
    question: "Летит пламя, но не сжигает; рев есть, но не слышен. Кто это?", 
    answer: "Бейлон",
    coordinates: [51.507351, -0.127758] 
  },  
  { 
    question: "Две сестры, одна корона — кто возьмёт, тот и закон. О чём речь?", 
    answer: "Рейнира и Алисента",
    coordinates: [35.689487, 139.691711] 
  },  
  { 
    question: "Без головы, но шепчет; без языка, но правит. Кто это?", 
    answer: "Варис",
    coordinates: [41.902782, 12.496366] 
  },  
  { 
    question: "Чёрный или белый — но всегда в огне. Что это?", 
    answer: "Дракарис",
    coordinates: [55.755825, 37.617298] 
  },  
]

const currentStep = ref(0);
const userAnswer = ref("");
const attemptsLeft = ref(maxAttempts);
const currentPoints = ref(maxPointsPerQuestion);
const totalScore = ref(0);
const showResult = ref(false);
const resultMessage = ref("");
const isAnswered = ref(false);
const isInvalid = ref(false)

const isFinished = computed(() => currentStep.value >= riddles.length);
const currentRiddle = computed(() => riddles[currentStep.value] || {});

function submitAnswer() {
  if (!userAnswer.value.trim() || isAnswered.value || attemptsLeft.value <= 0)
    return;

  const normalized = userAnswer.value.trim().toLowerCase();
  const correct = currentRiddle.value.answer.toLowerCase();

  if (normalized === correct) {
    resultMessage.value = "✅ Верно!";
    store.addPoints(currentPoints.value)
    isAnswered.value = true;
    showResult.value = true;
    isInvalid.value = false
  } else {
    attemptsLeft.value--;
    currentPoints.value = currentPoints.value - (maxPointsPerQuestion / 3);
    isInvalid.value = true

    if (attemptsLeft.value > 0) {
      resultMessage.value = `❌ Неверно.\nОсталось попыток: ${attemptsLeft.value}`;
    }

    if (attemptsLeft.value === 0) {
      resultMessage.value = `❌ Все попытки исчерпаны.\nПравильный ответ: ${currentRiddle.value.answer}`;
      isAnswered.value = true;
    }

    showResult.value = true;
  }
}

function nextQuestion() {
  currentStep.value++;
  userAnswer.value = "";
  attemptsLeft.value = maxAttempts;
  currentPoints.value = maxPointsPerQuestion;
  showResult.value = false;
  resultMessage.value = "";
  isAnswered.value = false;
}
</script>

<style scoped lang="scss">
.quiz-page {
  min-height: 100vh;
  padding: 2.4rem 1.6rem;
  background-color: #f9f9fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  .quiz-box {
    width: 100%;
    max-width: 32rem;
    background-color: #fff;
    border-radius: 1.6rem;
    padding: 2.4rem 2rem;
    box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .step-counter {
    font-size: 1.6rem;
    color: #888;
    margin-bottom: 1.6rem;
    text-align: center;
  }

  .question-text {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2.4rem;
    text-align: center;
    color: #333;
  }

  .question-location {
    margin-bottom: 2.4rem;
    text-align: center;
  }

  .input-wrapper {
    display: flex;
    max-width: 100%;
    flex-flow: row nowrap;
    gap: 1.2rem;
    margin-bottom: 1.6rem;

    input {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 1.6rem;
      padding: 1rem 1.2rem;
      border-radius: 1rem;
    }

    .p-button {
      flex: 0 0 auto;
      width: 4rem;
      height: 4rem;
      font-size: 1.6rem;
      padding: 1rem 2rem;
      border-radius: 1rem;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
    width: 100%;

    .p-button {
      font-size: 1.6rem;
      width: 100%;
      padding: 1rem 1.6rem;
      border-radius: 1rem;
    }
  }

  .result-message {
    text-align: center;
    justify-self: flex-start;
    font-size: 1.6rem;
    height: 2rem;
    margin-top: 1.2rem;
    font-weight: 500;
  }

  .quiz-finished {
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    margin-top: 2rem;
  }
}
</style>
