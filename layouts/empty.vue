<template>
    <slot>
    </slot>
</template>

<script setup lang="ts">

useHead({
  htmlAttrs: {
    class: 'darkmode'
  }
})

</script>

<style lang="scss">

.p-button {
    color: white;
}
</style>