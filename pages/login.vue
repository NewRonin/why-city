<template>
  <div class="login-page">
    <h1>НАЧАТЬ ИГРУ</h1>
    <div class="button-wrapper">
      <Button label="Я участник" severity="primary" @click="navigateTo('/')" />
      <Button label="Я организатор" severity="secondary" outlined />
    </div>
  </div>
</template>


<style scoped lang="scss">

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;

  h1 {
    font-family: AKONY;
    font-size: 2rem; 
    margin-bottom: 5rem;
    font-weight: 700;
  }

  .button-wrapper {
    width: 100%;
    max-width: 20rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .p-button {
      font-size: 1.6rem;
      padding: 1.5rem 3rem;
      border-radius: 1.5rem;
    }
  }
}

</style>
