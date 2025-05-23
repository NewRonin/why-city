<template>
  <div class="quiz-page">
    <div v-if="!isFinished" class="quiz-box">
      <div class="step-counter">
        Вопрос {{ currentStep + 1 }} из {{ riddles.length }}
      </div>

      <div class="question-text">
        {{ currentRiddle.question }}
      </div>

      <div class="input-wrapper">
        <InputText
          v-model="userAnswer"
          :disabled="isAnswered || attemptsLeft === 0"
          @keyup.enter="submitAnswer"
        />
        <Button
          label="Проверить"
          @click="submitAnswer"
          :disabled="isAnswered || attemptsLeft === 0"
        />
      </div>

      <div class="result-message">
        <div v-if="showResult">{{ resultMessage }}</div>
      </div>

      <div v-if="isAnswered || attemptsLeft === 0" class="action-buttons">
        <Button label="Далее" @click="nextQuestion" />
      </div>
    </div>

    <div v-else class="quiz-finished">
      🎉 Квиз завершён! <br />
      Ваш счёт: <strong>{{ totalScore }}</strong> из {{ riddles.length * maxPointsPerQuestion }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const maxAttempts = 3
const maxPointsPerQuestion = 3

const riddles = [
  { question: 'Сидит дед, во сто шуб одет. Кто это?', answer: 'лук' },
  { question: 'Не лает, не кусает, а в дом не пускает.', answer: 'замок' },
  { question: 'Что можно увидеть с закрытыми глазами?', answer: 'сон' }
]

const currentStep = ref(0)
const userAnswer = ref('')
const attemptsLeft = ref(maxAttempts)
const currentPoints = ref(maxPointsPerQuestion)
const totalScore = ref(0)
const showResult = ref(false)
const resultMessage = ref('')
const isAnswered = ref(false)

const isFinished = computed(() => currentStep.value >= riddles.length)
const currentRiddle = computed(() => riddles[currentStep.value] || {})

function submitAnswer() {
  if (!userAnswer.value.trim() || isAnswered.value || attemptsLeft.value <= 0) return

  const normalized = userAnswer.value.trim().toLowerCase()
  const correct = currentRiddle.value.answer.toLowerCase()

  if (normalized === correct) {
    resultMessage.value = '✅ Верно!'
    totalScore.value += currentPoints.value
    isAnswered.value = true
    showResult.value = true
  } else {
    attemptsLeft.value--
    currentPoints.value--
    userAnswer.value = ''

    if (attemptsLeft.value > 0) {
      resultMessage.value = `❌ Неверно. Осталось попыток: ${attemptsLeft.value}`
    }

    if (attemptsLeft.value === 0) {
      resultMessage.value = `❌ Все попытки исчерпаны. Правильный ответ: ${currentRiddle.value.answer}`
      isAnswered.value = true
    }

    showResult.value = true
  }
}

function nextQuestion() {
  currentStep.value++
  userAnswer.value = ''
  attemptsLeft.value = maxAttempts
  currentPoints.value = maxPointsPerQuestion
  showResult.value = false
  resultMessage.value = ''
  isAnswered.value = false
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

  .quiz-box {
    width: 100%;
    max-width: 32rem;
    background-color: #fff;
    border-radius: 1.6rem;
    padding: 2.4rem;
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

  .input-wrapper {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 1.6rem;

    input {
      flex: 1;
      font-size: 1.6rem;
      padding: 1rem 1.2rem;
      border-radius: 1rem;
    }

    .p-button {
      font-size: 1.6rem;
      padding: 1rem 1.6rem;
      border-radius: 1rem;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;

    .p-button {
      font-size: 1.6rem;
      padding: 1rem 1.6rem;
      border-radius: 1rem;
    }
  }

  .result-message {
    text-align: center;
    font-size: 1.6rem;
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