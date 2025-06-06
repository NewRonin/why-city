<template>
  <div class="admin-page">
    <div class="admin-container">
      <h1 class="admin-title">Админ-панель</h1>
      <div class="admin-sections">
        <div class="admin-card" @click="navigate('/admin/routes')">
          <div class="admin-card-title">Маршруты</div>
          <div class="admin-card-desc">Управление маршрутами и их точками</div>
        </div>

        <div class="admin-card" @click="navigate('/admin/teams')">
          <div class="admin-card-title">Команды</div>
          <div class="admin-card-desc">Добавление, редактирование и контроль команд</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

function navigate(path: string) {
  router.push(path)
}
</script>

<style scoped lang="scss">
.admin-page {
  min-height: 100dvh;
  background-color: #f9f9fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.4rem 1.6rem;
}

.admin-container {
  width: 100%;
  max-width: 80rem;
  background-color: #fff;
  border-radius: 1.6rem;
  padding: 3.2rem;
  box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
}

.admin-title {
  font-size: 2.4rem;
  font-weight: 700;
  text-align: center;
  color: #333;
}

.admin-sections {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  @media(min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
}

.admin-card {
  flex: 1 1 auto;
  background-color: #f1f3f7;
  border-radius: 1.2rem;
  padding: 2rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.1);
  }
}

.admin-card-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #222;
}

.admin-card-desc {
  font-size: 1.4rem;
  color: #666;
}
</style>