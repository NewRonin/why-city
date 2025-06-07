<template>
  <div class="quiz-page">
    <div v-if="isLoading" class="loading-state">Загрузка вопросов...</div>

    <div v-else-if="!isFinished" class="quiz-box">
      <div class="step-counter">
        Миссия {{ currentStep }} из {{ riddles.length }}
      </div>

      <div v-if="currentRiddle?.coordinates" class="question-location">
        <YandexMap
          :coordinates="currentRiddle.coordinates"
          :zoom="18"
          placemark-text="Текущее местоположение"
        />
        <YandexLink
          :coordinates="currentRiddle.coordinates"
          :address="currentRiddle.address"
        />
      </div>

      <div v-if="currentRiddle" class="question-title">
        Задание:
      </div>
      <div v-if="currentRiddle" class="question-text">
        {{ currentRiddle.taskText || currentRiddle.title }}
      </div>

      <audio
        class="question-audio"
        v-if="currentRiddle?.filePath && currentRiddle.taskType === 'audio'"
        controls
      >
        <source :src="currentRiddle.filePath" :type="currentRiddle.mimeType" />
      </audio>

      <img
        v-if="currentRiddle?.filePath && currentRiddle.taskType === 'image'"
        :src="currentRiddle.filePath"
        class="question-image"
        alt="Task Image"
      />

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
        <Button
          label="Далее"
          @click="nextQuestion"
          :disabled="!isAnswered && attemptsLeft > 0"
        />
      </div>
    </div>

    <div v-else class="quiz-finished">
  <!-- 🎉 Квест завершён! <br />
      Ваш счёт: {{ store.score }}$
      <Button 
        label="Результаты" 
        @click="navigateToResults"
        class="results-button"
      /> -->
    </div>

    <div class="result-message">
      <div :style="{ visibility: showResult ? 'visible' : 'hidden' }">
        {{ resultMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useMainStore } from "@/stores/main";

const store = useMainStore();
const maxAttempts = 3;

// Состояние загрузки
const isLoading = ref(true);
const riddles = ref([]);
const currentStep = ref(1);
const userAnswer = ref("");
const attemptsLeft = ref(maxAttempts);
const showResult = ref(false);
const resultMessage = ref("");
const isAnswered = ref(false);
const isInvalid = ref(false);
const teamId = ref(null);
const score = ref(0);
const isFinished = ref(false);

// Загрузка состояния
onMounted(async () => {
  try {
    const data = await $fetch("/api/quiz", {
      query: { teamPassword: store.password },
    });

    if (data?.questions?.length) {
      riddles.value = data.questions;
      currentStep.value = data.currentPoint || 1;
      store.score = data.score || 0;
      isFinished.value = data.isFinished
      attemptsLeft.value = maxAttempts - (data.attemptsUsed || 0);

      if (isFinished.value) {
        navigateTo('/final')
      }
    } else {
      console.error("Нет данных вопросов");
      // Можно добавить редирект или сообщение об ошибке
    }
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    // Обработка ошибки (редирект, уведомление и т.д.)
  } finally {
    isLoading.value = false;
  }
});

const currentRiddle = computed(() => {
  const riddle = riddles.value[currentStep.value - 1];
  if (!riddle) return null;

  // Форматируем координаты для YandexMap
  if (riddle.latitude && riddle.longitude) {
    riddle.coordinates = [riddle.latitude, riddle.longitude];
  }

  return riddle;
});

async function submitAnswer() {
  if (!userAnswer.value.trim() || isAnswered.value || attemptsLeft.value <= 0 || !currentRiddle.value) return;

  try {
    const response = await $fetch("/api/quiz", {
      query: { teamPassword: store.password },
      method: "POST",
      body: {
        pointId: currentRiddle.value.id,
        answer: userAnswer.value.trim()
      },
    });

    if (response?.isCorrect) {
      resultMessage.value = currentRiddle.value.successMessage || `✅ Верно! +${response.newScore}$`;
      score.value += response.newScore; // +=, не =
      isAnswered.value = true;
    } else {
      attemptsLeft.value--;
      resultMessage.value = attemptsLeft.value > 0
        ? `❌ Неверно. Осталось попыток: ${attemptsLeft.value}`
        : `❌ Правильный ответ: ${response?.correctAnswer || ''}`;
      isInvalid.value = true;
    }

    showResult.value = true;
  } catch (error) {
    console.error("Ошибка:", error);
    resultMessage.value = "Ошибка при отправке ответа";
    showResult.value = true;
    isInvalid.value = true;
  }
}

const nextQuestion = async () => {
  if (isFinished.value) return;

  try {
    const response = await $fetch("/api/quiz/next", {
      method: "POST",
      body: {
        teamPassword: store.password,
        clientPoint: currentStep.value,
      },
    });

    if (response.isFinished) {
      isFinished.value = true;
      return;
    }

    currentStep.value = response.newCurrentPointOrder;
    score.value = response.newScore || score.value;

    // Сброс состояния
    userAnswer.value = "";
    attemptsLeft.value = maxAttempts;
    showResult.value = false;
    resultMessage.value = "";
    isAnswered.value = false;
    isInvalid.value = false;

    nextTick(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  } catch (error) {
    console.error("Ошибка при переходе к следующему вопросу:", error);
    resultMessage.value = "Произошла ошибка при переходе к следующему вопросу";
    isInvalid.value = true;
  }
};

const navigateToResults = () => {
  navigateTo('/final')
}

</script>

<style scoped>
.loading-state {
  font-size: 1.8rem;
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>

<style scoped lang="scss">
.quiz-page {
  position: relative;
  width: 100%;
  height: 100;
  padding: 2.4rem 1.6rem;
  background-color: #232323; // base-black
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  .quiz-box {
    width: 100%;
    max-width: 90rem;
    background-color: #2e2e2e; // slightly lighter than base-black
    border-radius: 1.6rem;
    padding: 2.4rem 2rem;
    box-shadow: 0 0.4rem 1.6rem rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .step-counter {
    font-size: 1.6rem;
    color: #cccccc;
    margin-bottom: 1.6rem;
    text-align: center;
  }

  .question-title {
    width: 100%;
    font-weight: 600;
    font-size: clamp(0.8rem, 5vw, 2rem);
    margin-bottom: 2.4rem;
    text-align: left;
    color: #f5f5f5; // light white
  }

  .question-text {
    width: 100%;
    font-size: clamp(0.8rem, 5vw, 2rem);
    margin-bottom: 2.4rem;
    text-align: left;
    color: #f5f5f5;
  }

  .question-audio {
    width: 100%;
    margin-bottom: 2.4rem;
  }

  .question-image {
    margin-bottom: 2.4rem;
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 0.8rem;
  }

  .question-location {
    margin-bottom: 2.4rem;
    text-align: center;
    display: flex;
    flex-flow: column wrap;
    gap: 1.6rem;
    color: #f5f5f5;
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
      border: 1px solid #555;
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
    height: 2rem;
    margin-top: 1.2rem;
    font-weight: 500;
    color: var(--light-white);

    * {
      font-family: GTA;
      font-weight: 400;
      font-size: 1.6rem;
    }
  }

  .quiz-finished {
    font-family: GTA;
    font-weight: 400;
    font-size: clamp(2rem, 12vw, 10rem);
    text-align: center;
    margin-top: 2rem;
    color: var(--light-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 4rem;

    .results-button {
      width: 100%;
      height: 5rem;
      font-size: 1.6rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
  }
}
</style>

