export default defineNuxtPlugin(() => {
  if (process.client && !document.getElementById('yandex-maps-script')) {
    const script = document.createElement('script')
    script.id = 'yandex-maps-script'
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
    script.type = 'text/javascript'
    document.head.appendChild(script)
  }
})
