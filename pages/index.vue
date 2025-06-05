<template>
  <div class="quiz-page">
    <div v-if="isLoading" class="loading-state">Загрузка вопросов...</div>

    <div v-else-if="!isFinished" class="quiz-box">
      <div class="step-counter">
        Вопрос {{ currentStep }} из {{ riddles.length }}
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

      <NuxtImg
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
      🎉 Квест завершён! <br />
      Ваш счёт: <strong>{{ score }}$</strong>
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
      teamId.value = data.teamId;
      currentStep.value = data.currentPoint || 1;
      score.value = data.score || 0;
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
  if (!userAnswer.value.trim() || isAnswered.value || attemptsLeft.value <= 0 || !currentRiddle.value) return

  try {
    const response = await $fetch("/api/quiz", {
      method: "POST",
      body: {
        teamId: teamId.value,
        pointId: currentRiddle.value.id,
        answer: userAnswer.value.trim(),
        attempts: maxAttempts - attemptsLeft.value,
      },
    })

    if (response?.isCorrect) {
      resultMessage.value = currentRiddle.value.successMessage || "✅ Верно! +" + response.newScore
      score.value += response.newScore
      isFinished.value = response.isFinished
      isAnswered.value = true
      
      // Auto-advance if correct
      if (!isFinished.value) {
        setTimeout(nextQuestion, 1500)
      }
    } else {
      attemptsLeft.value--
      resultMessage.value = attemptsLeft.value > 0
        ? `❌ Неверно. Осталось попыток: ${attemptsLeft.value}`
        : `❌ Правильный ответ: ${response?.correctAnswer || currentRiddle.value.correctAnswer}`
    }
    showResult.value = true
    isInvalid.value = !response?.isCorrect

  } catch (error) {
    console.error("Ошибка:", error)
    resultMessage.value = "Ошибка при отправке ответа"
    showResult.value = true
  }
}

const nextQuestion = async () => {
  if (isFinished.value || isAnswered.value) return;

  try {
    // Отправляем запрос на переход к следующему вопросу
    const response = await $fetch('/api/quiz/next', {
      method: 'POST',
      body: {
        teamId: teamId.value,
        currentPoint: currentStep.value // или questions.value[currentStep.value].id
      }
    });

    // Обновляем локальное состояние на основе ответа сервера
    currentStep.value = response.newCurrentPoint;
    isFinished.value = response.isFinished;
    score.value = response.newScore || score.value;

    // Сбрасываем состояние для нового вопроса
    userAnswer.value = "";
    attemptsLeft.value = maxAttempts;
    showResult.value = false;
    resultMessage.value = "";
    isAnswered.value = false;
    isInvalid.value = false;

    // Прокрутка к верху страницы
    nextTick(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

  } catch (error) {
    console.error('Error moving to next question:', error);
    // Обработка ошибок
    isInvalid.value = true;
    resultMessage.value = 'Произошла ошибка при переходе к следующему вопросу';
  }
};
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
  padding: 2.4rem 1.6rem;
  background-color: #f9f9fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  .quiz-box {
    width: 100%;
    max-width: 90rem;
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

  .question-title{
    width: 100%;
    font-weight: 600;
    font-size: clamp(.8rem, 5vw, 2rem);
    margin-bottom: 2.4rem;
    text-align: left;
    color: #333;
  }

  .question-text {
    width: 100%;
    font-size: clamp(.8rem, 5vw, 2rem);
    margin-bottom: 2.4rem;
    text-align: left;
    color: #333;
  }

  .question-audio{
    width: 100%;
    margin-bottom: 2.4rem;
  }

  .question-image {
    margin-bottom: 2.4rem;
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  .question-location {
    margin-bottom: 2.4rem;
    text-align: center;
    display: flex;
    flex-flow: column wrap;
    gap: 1.6rem;
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
