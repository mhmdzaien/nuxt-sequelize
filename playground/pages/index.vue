<script setup lang="ts">
const route = useRoute()

onMounted(() => {
  fetch()
})

const fetch = () => {
  $fetch('/')
}
if (import.meta.client) {
  const eventSource = new EventSource('/sse')
  eventSource.onmessage = (event) => {
    console.log(JSON.parse(event.data))
  }
}
</script>

<template>
  <div>
    <h1>Nuxt Routing set up successfully!</h1>
    <p>Current route: {{ route.path }}</p>
    <a
      href="https://nuxt.com/docs/getting-started/routing"
      target="_blank"
    >Learn more about Nuxt Routing</a>
  </div>
</template>
