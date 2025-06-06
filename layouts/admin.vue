<template>
  <div class="layout">
    <VHeader class="header" @toFooter="scrollToFooter" />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">

const scaleContacts = ref(false)

function scrollToFooter() {
  const footer = document.getElementById('footer');

  if (footer) {
    footer.scrollIntoView({ behavior: 'smooth' });
    scaleContacts.value = true

    setTimeout(() => scaleContacts.value = false, 4000)
  }
}

useHead({
  bodyAttrs: {
      class: 'body-light'
    }
})
</script>

<style scoped lang="scss">
.layout {
  width: 100dvw;
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  width: 100dvw;
  min-height: 100dvh;
  overflow: hidden;
}

.content{
  width: 100%;
}
</style>
