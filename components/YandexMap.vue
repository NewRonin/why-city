<template>
  <div id="yandex-map" ref="mapRef" style="width: 100%; height: 300px;"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps } from 'vue'

const props = defineProps<{
  coordinates: [number, number]
  zoom?: number
  placemarkText?: string
}>()

const mapRef = ref<HTMLElement | null>(null)
let map: any = null
let placemark: any = null

const loadYandexMaps = (): Promise<any> => {
  return new Promise((resolve) => {
    const check = () => {
      if (window.ymaps) {
        resolve(window.ymaps)
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

onMounted(async () => {
  const ymaps = await loadYandexMaps()
  ymaps.ready(() => {
    map = new ymaps.Map(mapRef.value, {
      center: props.coordinates,
      zoom: props.zoom || 10,
      controls: ['zoomControl'],
    })

    placemark = new ymaps.Placemark(props.coordinates, {
      balloonContent: props.placemarkText || 'Метка',
    })

    map.geoObjects.add(placemark)
  })
})

// Обновление координат реактивно
watch(() => props.coordinates, (newCoords) => {
  if (map && placemark) {
    map.setCenter(newCoords)
    placemark.geometry.setCoordinates(newCoords)
  }
})
</script>
