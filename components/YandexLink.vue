<template>
   <span class="container-place">
    <span class="container-text">
        Место:
    </span>
    <NuxtLink 
        class="container-link"
        :to="`https://yandex.ru/maps/?pt=${coordinates[1]},${coordinates[0]}&z=15`"
        target="_blank"
        external
    >
        {{ address }}
    </NuxtLink>
   </span>
</template>

<script setup lang="ts">
    const props = defineProps<{
        address: string,
        coordinates: [number, number]
    }>()
</script>

<style scoped lang="scss">
    .container-place {
        display: inline-block;
        text-align: left;

        .container-text, .container-link {
            font-size: 1.6rem;
        }

        .container-link {
            color: var(--main);
        }
    }
</style>