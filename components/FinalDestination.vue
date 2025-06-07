<template>
    <div class="page-container">
        <div class="container-mystery">
            <h1>ГДЕ PARTY?</h1>
            <Button label="Узнать"></Button>
        </div>
        <div class="container-final">
            <h1>ALCATRAZ BAR</h1>
            <div class="final-location">
                <YandexMap
                    :coordinates="[43.993333, 56.327147]"
                    :zoom="18"
                    placemark-text="GDE PARTY"
                />
                <YandexLink
                    :coordinates="[43.993333, 56.327147]"
                    address="Почаинская ул.,17с, Нижний Новгород"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useMainStore } from "@/stores/main";
</script>

<style scoped lang="scss">

.final-location {
    margin-bottom: 2.4rem;
    text-align: center;
    display: flex;
    flex-flow: column wrap;
    gap: 1.6rem;
    color: #f5f5f5;
  }

</style>