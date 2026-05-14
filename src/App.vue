<template>
  <div id="app" :class="{ 'dark-mode': isDark }">
    <NavBar />
    <router-view />
    <PlayerBar />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PlayerBar from './components/PlayerBar.vue'
import NavBar from './components/NavBar.vue'
import { usePlayerStore } from './stores/playerStore'

const playerStore = usePlayerStore()
const isDark = ref(true)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    localStorage.setItem('theme', 'light')
    isDark.value = false
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>